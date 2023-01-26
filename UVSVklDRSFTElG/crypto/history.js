var mongoose = require('mongoose');

var user = require('../../model/user'),
	crypto = require('../../model/crypto');

var Helper = require('../../helper/helper'),
	Mailer = require('../../helper/mailer'),
	Common = require('../../helper/common'),
	Encrypter = require('../../helper/encrypter');

module.exports.list = (req, res) => {
	if (Common._validate_origin(req, res)) {
		var filter = {};
		if (req.params.module != 'all') {
			filter = { category: req.params.module.toLowerCase() };
		}

		if (Object.keys(req.body).length > 0) {
			if (req.body.from !== undefined && req.body.from !== null && req.body.from !== '' && req.body.to !== undefined && req.body.to !== null && req.body.to !== '') {
				sdate = encrypter.dateToYMD(req.body.from);
				sdate = sdate + 'T00:00:00.000Z';
				edate = encrypter.dateToYMD(req.body.to);
				edate = edate + 'T23:59:59.000Z';
				filter = Object.assign({}, filter, { date: { $gte: new Date(sdate), $lt: new Date(edate) } });
			}
		}

		crypto.aggregate([{ $match: filter },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'currency', foreignField: 'symbol', as: 'coin_data' } },
		{ $unwind: '$coin_data' },
		{ $project: { email: '$user_data.email', ordertype: 1, currency: 1, amount: 1, fee: { $add: ['$fee', '$mainFee'] }, date: 1, status: 1, logo: '$coin_data.logo' } },
		{ $sort: { date: -1 } }], (err, response) => {
			if (response.length > 0) {
				response = response.map(e => {
					e.email = Encrypter.decrypt_data(e.email)
					return e;
				});
				res.status(200).send({ status: true, code: 200, data: response })
			} else if (response.length == 0)
				res.status(201).send({ status: false, code: 401, message: 'No records found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}

module.exports.view = (req, res) => {
	if (Common._validate_origin(req, res)) {
		var order_id = mongoose.Types.ObjectId(req.params.id);
		crypto.findOne({ _id: order_id }, async (err, response) => {
			if (response) {
				response.fee = response.fee + response.mainFee;
				res.status(200).send({ status: true, code: 200, data: response })
			}
			else if (!response)
				res.status(201).send({ status: false, code: 401, message: 'No results found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}
module.exports._crypto_history = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var filter = { userId: mongoose.Types.ObjectId(req.user_id) };
		if (Object.keys(req.body).length > 0) {
			if (req.body.txnid !== undefined && req.body.txnid !== null && req.body.txnid !== '')
				filter.paymentId = req.body.txnid;
			if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '' && req.body.type.toLowerCase() !== 'all')
				filter.ordertype = req.body.type.toLowerCase() == 'withdraw' ? 'send' : 'receive';
			if (req.body.status !== undefined && req.body.status !== null && req.body.status !== '' && req.body.status.toLowerCase() !== 'all') {
				if (req.body.status == 'Pending') { req.body.status = '2' }
				else if (req.body.status == 'Completed') { req.body.status = '1' }
				else if (req.body.status == 'Cancelled') { req.body.status = '0' }
				else { req.body.status = 'All' }
				filter.status = Number(req.body.status);
			}
			if (req.body.currency !== undefined && req.body.currency !== null && req.body.currency !== '' && req.body.currency.toLowerCase() !== 'all')
				filter.currency = req.body.currency.toLowerCase();
			if (req.body.date !== '' && req.body.date !== undefined && req.body.date !== null) {
				if (req.body.date.length > 0) {
					sdate = req.body.date[0].split('T')[0];
					edate = req.body.date[1].split('T')[0];
					sdate = sdate.replace('T', 'T00:00:00.000Z');
					edate = edate.replace('T', 'T23:59:59.000Z');
					filter.date = { $gte: new Date(sdate), $lt: new Date(edate) };
				}
			}
		}
		crypto.aggregate([
			{ $match: filter },
			{ $sort: { date: -1 } },
			{ $project: { amount: '$actualamount', total: '$amount', fee: '$fee', address: '$receiveaddress', currency: 1, txnid: '$hash', type: '$ordertype', date: 1, status: 1, comment: '$description', remarks: '$remarks', url: '$explorer', gasFee: 1, gasFeeCurrency: 1, reward: { $cond: [{ $ne: ['$depositRewardValue', undefined] }, "$depositRewardValue", 0] }, send_data: { $cond: [{ $eq: ["$ordertype", "send"] }, "$conversion", null] }, receive_data: { $cond: [{ $eq: ["$ordertype", "receive"] }, "$conversion", null] } } }
		], (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 401, message: 'Server not found' })
		})
	}
}