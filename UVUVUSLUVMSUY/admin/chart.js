var url = require("url"),
	express = require('express');

var router = express.Router();
var symbolsDatabase = require("./symbols_database");
var RequestProcessor = require("./request-processor").RequestProcessor;
var requestProcessor = new RequestProcessor(symbolsDatabase);

var pair = require('../../model/pair'),
	currency = require('../../model/currency'),
	trade = require('../../model/trade'),
	settings = require('../../model/site'),
	order = require('../../model/order');

var commonHelper = require('../../helper/2fa'),
	Auth = require('../../helper/auth'),
	Common = require('../../helper/common');

var mapTrade = function () { };
var _tradeMap = new mapTrade();

router.get('/trade/chart/:config', Auth.verify_origin, (req, res) => {
	if (Common._validate_origin(req, res)) {
		try {
			var uri = url.parse(req.url, true);
			var action = uri.pathname;
			symbolsDatabase.initGetAllMarketsdata();
			switch (action) {
				case '/trade/chart/config':
					action = '/config';
					break;
				case '/trade/chart/time':
					action = '/time';
					break;
				case '/trade/chart/symbols':
					action = '/symbols';
					break;
				case '/trade/chart/history':
					action = '/history';
					break;
			}
			return requestProcessor.processRequest(action, uri.query, res);
		} catch (err) {
		}
	}
});



router.get('/api/v1/markets', Auth.verify_origin, async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var supported_currency = ['usd', 'idr', 'twd', 'eur', 'krw', 'jpy', 'rub', 'cny', 'aed', 'ars', 'aud', 'bdt', 'bhd', 'bmd', 'brl', 'cad', 'chf', 'clp', 'czk', 'dkk', 'gbp', 'hkd', 'huf', 'ils', 'inr', 'kwd', 'lkr', 'mmk', 'mxn', 'myr', 'ngn', 'nok', 'nzd', 'php', 'pkr', 'pln', 'sar', 'sek', 'sgd', 'thb', 'try', 'uah', 'vef', 'vnd', 'zar', 'xdr'];
		var usr_currency;
		if (req.query.currency !== undefined && req.query.currency !== null && req.query.currency !== '')
			usr_currency = supported_currency.indexOf(req.query.currency.toLowerCase()) == -1 ? 'usd' : req.query.currency.toLowerCase();
		else
			usr_currency = 'usd';

		markets_datas(usr_currency, (result) => {
			if (result.data.length > 0) {

				res.status(200).send({ status: true, code: 200, data: result.data })
			}
			else
				res.status(201).send({ status: false, code: 400, message: 'No results found' })
		})
	}
});

async function markets_datas(usr_currency, cb) {

	pair.aggregate([
		{ $match: { status: true } },
		{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'currency_data1' } },
		{ $unwind: '$currency_data1' },
		{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'secondcurrency', foreignField: 'symbol', as: 'currency_data' } },
		{ $unwind: '$currency_data' },
		{ $addFields: { req_currency: `${ usr_currency }` } },
		{ $sort: { 'currency_data1.coin_id': 1 } },
		{
			$project: {
				pair: 1, change: 1, volume: 1, lastprice: 1, high: 1, low: 1, firstcurrency: '$currency_data1.id', secondcurrency: '$currency_data.id',
				currency: { $toUpper: '$req_currency' }, logo: '$currency_data1.logo', coin_name: '$currency_data1.currency',
				circulating_supply: '$currency_data1.circulating_supply', btc_value: '$currency_data.btc_value'
			}
		},
		{ $sort: { pair_id: 1 } }
	], (err, market_data) => {
		if (market_data.length > 0) {
			commonHelper._get_priceList((converted_data) => {
				var resultData = market_data.map(e => {
					e.volume_reverted = e.volume;
					e.total_volume = market_data.filter(results => { return results.pair.split('/')[0].toLowerCase() == e.pair.split('/')[0].toLowerCase() }).map(e => { return e.trade_volume_result }).reduce((a, b) => a + b, 0)
					e.pair_name = e.pair;
					e.btc_value = e.btc_value;
					var first = e.pair.split('/')[0].toLowerCase(),
						second = e.pair.split('/')[1].toLowerCase();
					if (second == 'usd')
						e.converted_price = 1;
					else
						e.converted_price = converted_data.data[e.secondcurrency]['usd'];

					e.conversion = e['lastprice'] * e.converted_price;
					e.market_second_price = e.converted_price;
					e.firstcurrency = first;
					e.secondcurrency = second;
					e.url = `${ first }-${ second }`;
					e.pair = `${ first } / ${ second }`;
					return e;
				})
				cb({ data: resultData })
			})
		}
		else
			cb({ data: [] })
	})
}

router.get('/public', Auth.verify_origin, async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var pair_data = await pair.findOne({ pair: req.query.currencyPair.replace('_', '/').toLowerCase() }).exec();
		var collection = pair_data.bot_status == true ? tempOrder : order;
		var selected_pair = req.query.currencyPair != undefined ? req.query.currencyPair.toLowerCase().replace('_', '/') : 'btc/noc',
			record_limit = req.query.depth != undefined ? parseInt(req.query.depth) : 50,
			now = new Date(), asks = [], bids = [];

		collection.aggregate([
			{ $match: { pair: selected_pair } },
			{ $project: { price: 1, amount: 1, total: 1, pair: 1, type: 1, _id: 0 } },
			{ $sort: { date: -1 } },
			{ $limit: record_limit }
		], (err, response) => {
			if (response) {
				asks = response.filter(e => { return e.type == "buy" }).map(function (ele) {
					var arr = [];
					arr.push(ele.amount.toString(), ele.price);
					return arr;
				})

				bids = response.filter(e => { return e.type == "sell" }).map(function (ele) {
					var arr = [];
					arr.push(ele.amount.toString(), ele.price);
					return arr;
				})
				res.send({ asks: asks, bids: bids, isFrozen: 0, seq: now.getTime() })
			} else
				res.send({ asks: asks, bids: bids, isFrozen: 0, seq: now.getTime() })
		})
	}
})

router.get('/trade/markets', (req, res) => {
	try {
		pair.aggregate([{ $project: { _id: 0, name: { $toUpper: '$pair' }, from: { $toUpper: "$firstcurrency" }, to: { $toUpper: "$secondcurrency" }, "type": { $literal: "crypto" }, "exchange": { $literal: "Mradhul Exchange" } } }]).exec(function (err, pairdata) {
			res.json(pairdata);
		});
	} catch (err) {
		res.json(err);
	}
});

router.get('/trade/chartData', (req, res) => {
	var resolution = req.query.resolution;
	if (resolution == "1d") {
		resolution = 24 * 60 * 60;
	} else if (resolution == "1w") {
		resolution = 7 * 24 * 60 * 60;
	} else if (resolution == "1m") {
		resolution = 30 * 24 * 60 * 60;
	} else if (resolution == '1' || resolution == '2' || resolution == '5' || resolution == '15' || resolution == '30' || resolution == '60' || resolution == '240') {

		resolution = parseFloat(resolution) * 60;
	} else {
		resolution = 5 * 60;
	}
	resolution = resolution * 1000;

	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var pair = req.query.market;
	var start_date = req.query.start_date;
	var end_date = req.query.end_date;
	var spl = pair.split("_");
	var first = spl[0];
	var second = spl[1];
	var pair_name = spl[0] + '/' + spl[1];
	var pattern = /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/;
	if (start_date) {
		if (!pattern.test(start_date)) {
			res.send({ "message": "Start date is not a valid format" });
			return false;
		}
	}
	else {
		res.send({ "message": "Start date parameter not found" });
		return false;
	}
	if (end_date) {
		if (!pattern.test(end_date)) {
			res.send({ "message": "End date is not a valid format" });
			return false;
		}
	}
	else {
		res.json({ "message": "End date parameter not found" });
		return false;
	}

	var sDate = start_date + 'T00:00:00.000Z';
	var eDate = end_date + 'T23:59:59.000Z';
	if (sDate > eDate) {
		res.json({ "message": "Please ensure that the End Date is greater than or equal to the Start Date" });
		return false;
	}
	try {
		order.aggregate([
			{ $match: { pair: pair_name.toLowerCase(), date: { $gte: new Date(sDate), $lt: new Date(eDate) } } },
			{ $group: { _id: { $floor: { $divide: [{ "$subtract": ["$date", new Date("1970-01-01")] }, resolution] } }, count: { $sum: 1 }, Date: { $first: "$date" }, pair: { $first: '$pair' }, low: { $min: '$price' }, high: { $max: '$price' }, open: { $first: '$price' }, close: { $last: '$price' }, volume: { $sum: '$total' } } },
			{ $project: { _id: 0, Date: "$Date", pair: { $literal: pair }, low: "$low", high: "$high", open: "$open", close: "$close", volume: "$volume", exchange: { $literal: "Mradhul Exchange" } } },
			{ $sort: { Date: 1 } }
		]).exec(function (err, result) {
			if (err)
				return res.json([])
			else {
				result = result.map(e => {
					var arr = [];
					arr.push(e.Date.getTime(), e.open, e.high, e.low, e.close, e.volume);
					return arr;
				})
				return res.json(result);
			}
		});
	} catch {
		return res.json([])
	}
});

module.exports = router;