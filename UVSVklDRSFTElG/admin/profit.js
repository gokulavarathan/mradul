var profit = require('../../model/profit'),
	trade = require('../../model/trade'),
	order = require('../../model/order');

var Common = require('../../helper/common');

module.exports.list = (req, res) => {
	if (Common._validate_origin(req, res)) {
		var filter = {};
		if (req.params.filter != undefined && req.params.filter != 'all')
			filter = { category: req.params.filter.toLowerCase() }
		else
			filter = {};

		profit.aggregate([{ $match: filter }, { $sort: { date: -1 } }], (err, response) => {
			if (response)
				res.send({ status: true, code: 200, data: response })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.profit_amount = (req, res) => {
	if (Common._validate_origin(req, res)) {
		profit.aggregate([{ $group: { _id: '$currency', amount: { $sum: '$profit' } } }, { $project: { currency: '$_id', amount: '$amount', _id: 0 } }], (err, response) => {
			if (response)
				res.send({ status: true, code: 200, data: response })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.user_based_profit = (req, res) => {
	if (Common._validate_origin(req, res)) {
		profit.aggregate([{ $group: { _id: { currency: '$currency' }, amount: { $sum: '$amount' }, currency: { $first: '$currency' } } }, { $project: { currency: '$currency', amount: '$amount', _id: 0 } }], (err, response) => {
			if (response)
				res.send({ status: true, code: 200, data: response })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.profit_detail_data = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var find_profit = await profit.aggregate([
			{ $match: { _id: req.params.id } },
			{ $lookup: { from: 'MRADULEXG_ORDMAPSTE', localField: 'reference', foreignField: '_id', as: 'order_data' } },
			{ $unwind: '$order_data' },
			{ $lookup: { from: 'MRADULEXG_TRASTEUSE', localField: 'order_data.buyOrderId', foreignField: '_id', as: 'buyer_data' } },
			{ $unwind: '$buyer_data' },
			{ $lookup: { from: 'MRADULEXG_TRASTEUSE', localField: 'order_data.sellOrderId', foreignField: '_id', as: 'seller_data' } },
			{ $unwind: '$seller_data' }
		]).exec()
		res.send(find_profit)
	}
}