var site = require('../../model/site'),
	support = require('../../model/support'),
	support_message = require('../../model/message'),
	currency = require('../../model/currency'),
	pair = require('../../model/pair'),
	trade = require('../../model/trade');

var Helper = {
	Request: require('../../helper/2fa'),
	Socket: require('../../helper/config')
};
var Encrypter = require('../../helper/encrypter');

var Common = require('../../helper/common');

module.exports.token_info = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var usr_currency = 'USD';
		if (req.query.currency !== undefined || req.query.currency !== null || req.query.currency !== '') {
			usr_currency = req.query.currency.toUpperCase();
		};

		var volume_data = await pair.aggregate([
			{ $match: { status: true } },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'coin_data' } },
			{ $unwind: '$coin_data' },
			{ $project: { pair: 1, btc_value: '$coin_data.btc_value', volume: 1, binance_volume: 1, bot_status: 1, liquidity: 1, lastprice: 1, secondcurrency: 1, binance_price: 1 } }
		]).exec()
		var result = volume_data.map(element => {
			var value = 0;
			if (!element.bot_status && !element.liquidity)
				value = element.secondcurrency.toLowerCase() !== "inr" ? (element.volume * element.btc_value).toFixed(8) : (element.volume * element.btc_value).toFixed(2);
			else if (element.liquidity && !element.bot_status) {
				if (element.binance_price == 0)
					value = 0
				else
					value = element.secondcurrency.toLowerCase() !== "inr" ? ((element.binance_volume / element.binance_price) * element.btc_value).toFixed(8) : ((element.binance_volume / element.binance_price) * element.btc_value).toFixed(2)
			}
			else
				value = element.secondcurrency.toLowerCase() !== "inr" ? (element.volume * element.btc_value).toFixed(8) : (element.volume * element.btc_value).toFixed(2);

			value = parseFloat(value)
			return value;
		}).filter(e => { return e != null && e != undefined }).reduce((a, b) => a + b, 0)

		Helper.Request._get_priceList(['bitcoin'], usr_currency.toLowerCase(), (result_data) => {
			if (result_data.status) {
				Helper.Request._fiat_conversion(`INR_${ usr_currency }`, (fiat_convert) => {
					res.send({
						status: true,
						code: 200,
						data: {
							total_volume: result,
							inr_conversion: result_data.data['bitcoin'][usr_currency.toLowerCase()],
							user_conversion: fiat_convert.amount,
							user_currency: usr_currency
						}
					})
				})
			}
		})
	}
}

module.exports.filter_config = (req, res) => {
	if (Common._validate_origin(req, res)) {
		var type = [{ option: 'all' }, { option: 'buy' }, { option: 'sell' }],
		network = [{ option: 'erc20' }, { option: 'trc20' }, { option: 'bep20' }, { option: 'rpc' }],
			side = [{ option: 'All', value: 'all' }, { option: 'Limit Order', value: 'limit' }, { option: 'Stop Limit', value: 'stop' }],
			days = [{ option: 'All', value: 0 }, { option: 'Past 7 days', value: 7 }, { option: 'Past 30 days', value: 30 }, { option: 'Past 60 days', value: 60 }],
			status = [{ option: 'All', value: 'all' }, { option: 'Pending', value: 2 }, { option: 'Completed', value: 1 }, { option: 'Cancelled', value: 0 }],
			fiat_transfer = [{ option: 'All', value: 'all' }, { option: 'Deposit', value: 'deposit' }, { option: 'Withdraw', value: 'withdraw' }],
			crypto_transfer = [{ option: 'All', value: 'all' }, { option: 'Deposit', value: 'receive' }, { option: 'Withdraw', value: 'send' }],
			transfer_status = [{ option: 'All', value: 'all' }, { option: 'Pending', value: 2 }, { option: 'Completed', value: 1 }, { option: 'Cancelled', value: 0 }];
		var data = { type: type, side: side, days: days, status_data: status, fiat_transfer: fiat_transfer, crypto_transfer: crypto_transfer, transfer_status: transfer_status, network:network };
		res.send({ status: true, code: 200, data: data });
	}
}

module.exports.list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		site.findOne({}, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else if (!response)
				res.status(201).send({ status: false, code: 200, message: 'No results found' })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.view = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		site.findOne({}, { _id: 0 }, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else if (!response)
				res.status(201).send({ status: false, code: 200, message: 'No results found' })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.update = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		if (req.body._id == undefined || req.body._id == null || req.body._id == '') {
			site.create(req.body, (err, created) => {
				if (created) {
					if (created.sitemode) {
						Helper.Socket.sendmessage('under-control', { status: true, block: true, message: 'Site is temproarily locked' })
					}
					res.status(200).send({ status: true, code: 200, message: 'Site details updated successfully' })
				}
				else if (!created)
					res.status(201).send({ status: false, code: 400, message: 'Site details not updated' })
				else
					res.status(201).send({ status: false, code: 400, message: 'server not found' })
			})
		}
		else {
			site.updateOne({}, { $set: req.body }, (err, response) => {
				if (response.nModified == 1) {
					if (req.body.sitemode) {
						Helper.Socket.sendmessage('under-control', { status: true, block: true, message: 'Site is temproarily locked' })
					}
					res.status(200).send({ status: true, code: 200, message: 'Site details updated successfully' })
				}
				else if (response.nModified == 0)
					res.status(201).send({ status: false, code: 200, message: 'Already up to date. No changes found' })
				else
					res.status(201).send({ status: false, code: 400, message: 'server not found' })
			})
		}
	}
}

module.exports.get_all_tickets = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		support.find({}).sort({ date: -1 }).then(response => {
			res.status(200).send({ status: true, code: 200, data: response })
		}).catch(error => {
			res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.get_ticket_details = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var ticket_id = req.body.ticketId;
		var ticket_data = await support.findOne({ ticket_id: ticket_id }).exec()
		support_message.find({ messageId: ticket_id }, { tag: 1, message: 1, file: 1, date: 1, avatar: 1, name: 1 }).then(resData => {
			res.status(200).send({ status: true, code: 200, data: { ticketData: ticket_data, chat: resData } });
		}).catch(error => {
			res.status(201).send({ status: false, code: 400, message: 'No results found' });
		})
	}
}