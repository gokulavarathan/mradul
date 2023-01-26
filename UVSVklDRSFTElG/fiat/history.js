var mongoose = require('mongoose');

var user = require('../../model/user'),
	fiat = require('../../model/fiat');

var Helper = require('../../helper/helper'),
	Mailer = require('../../helper/mailer'),
	Common = require('../../helper/common'),
	Encrypter = require('../../helper/encrypter');

module.exports.list = async (req, res) => {
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

		fiat.aggregate([{ $match: filter },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'currency', foreignField: 'symbol', as: 'coin_data' } },
		{ $unwind: '$coin_data' },
		{ $project: { email: '$user_data.email', ordertype: '$category', currency: 1, amount: 1, fee: 1, date: 1, status: 1, logo: '$coin_data.logo' } },
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

module.exports.view = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		fiat.findOne({ _id: req.params.id }, async (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else if (!response)
				res.status(201).send({ status: false, code: 401, message: 'No results found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}
module.exports.get_user_history = (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.user_id);
		var filter = { userId: user_id };
		if (Object.keys(req.body).length > 0) {
			if (req.body.txnid !== undefined && req.body.txnid !== null && req.body.txnid !== '')
				filter.paymentId = req.body.txnid;
			if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '' && req.body.type.toLowerCase() !== 'all')
				filter.category = req.body.type.trim().toLowerCase();
			if (req.body.status !== undefined && req.body.status !== null && req.body.status !== '' && req.body.status.toLowerCase() !== 'all') {
				if (req.body.status == 'Pending') { req.body.status = '2' }
				else if (req.body.status == 'Completed') { req.body.status = '1' }
				else if (req.body.status == 'Cancelled') { req.body.status = '0' }
				else { req.body.status = 'All' }
				filter.status = Number(req.body.status);
			}
			if (req.body.currency !== undefined && req.body.currency !== null && req.body.currency !== '' && req.body.currency.toLowerCase() !== 'all')
				filter.currency = req.body.currency.trim().toLowerCase();
			if (req.body.date !== '' && req.body.date !== undefined && req.body.date !== null) {
				if (req.body.date.length > 0) {
					sdate = req.body.date[0].split('T')[0];
					edate = req.body.date[1].split('T')[0];
					sdate = sdate.replace('T', 'T00:00:00.000Z');
					edate = edate.replace('T', 'T23:59:59.000Z');
					filter.date = { $gte: new Date(sdate), $lt: new Date(edate) };
				}
			}
		};

		fiat.aggregate([{ $match: filter }, { $sort: { date: -1 } }, { $project: { comment: 1, date: 1, currency: 1, total: '$amount', amount: '$actualamount', txnid: '$paymentId', type: '$category', fee: { $add: ["$fee", "$mainFee"] }, status: 1, reward: '$depositRewardValue', method: { $cond: { if: { $and: [{ $eq: ["$category", "deposit"] }, { $eq: ["$gateway", "instantpay"] }] }, then: '$paymentMethod', else: '---' } } } }], (err, response) => {
			if (err)
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
			else {
				response = response.map(e => { if (e.type == "withdraw") { return e; } else { if (e.status == 1 || e.status == 0) { return e; } } });
				res.status(200).send({ status: true, code: 200, data: response })
			}
		})
	}
}