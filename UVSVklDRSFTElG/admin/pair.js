var request = require('request');

var pair = require('../../model/pair'),
	currency = require('../../model/currency'),
	order = require('../../model/order'),
	trade = require('../../model/trade');

var commonHelper = require('../../helper/2fa'),
	Common = require('../../helper/common');

var similar_data = ['bch/eth', 'dot/eth', 'xtz/eth', 'atom/eth', 'btc/eth', 'bsv/usdt', 'vet/inr', 'xtz/inr', 'xlm/inr', 'xmr/inr', 'xem/inr', 'iota/inr', 'bsv/inr', 'dash/inr', 'fil/inr', 'theta/inr', 'dot/inr', 'iota/inr'];



module.exports.top_pair = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var usr_currency = 'usd';

		pair.aggregate([
			{ $match: { status: true } },
			{ $addFields: { supply: 100, req_currency: usr_currency } },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'secondcurrency', foreignField: 'symbol', as: 'currency_data' } },
			{ $unwind: '$currency_data' },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'currency_first' } },
			{ $unwind: '$currency_first' },
			{
				$project: {
					pair: 1, high: 1, low: 1, volume: 1, change: 1, pair_id: 1, lastprice: 1, secondcurrency: '$currency_data.id',
					currency: { $toUpper: '$req_currency' }, logo: '$currency_first.logo', btc_value: '$currency_data.btc_value',
					btc_volume: { $multiply: ['$volume', '$currency_data.btc_value'] }
				}
			},
			{ $sort: { btc_volume: -1 } }
		], async (err, response) => {
			if (response.length > 0) {
				commonHelper._get_priceList((converted_data) => {
					var resultData = response.map(e => {
						e.pair_name = e.pair;
						var first = e.pair.split('/')[0].toLowerCase(),
							second = e.pair.split('/')[1].toLowerCase();

						if (second == 'usd')
							e.current_price = 1;
						else
							e.current_price = converted_data.data[e.secondcurrency]['usd'];

						e.conversion = e['lastprice'] * e.current_price;
						e.firstcurrency = first;
						e.secondcurrency = second;
						e.url = `${ first }-${ second }`;
						e.pair = `${ first } / ${ second }`;
						return e;
					})

					resultData = resultData.slice(0, 4)
					res.send({ status: true, code: 200, data: resultData })
				})
			}
			else if (response.length == 0)
				res.send({ status: false, code: 200, message: 'No orders found' })
			else
				res.send({ status: false, code: 200, message: 'Server not found' })
		})
	}
}

module.exports.list = (req, res) => {
	if (Common._validate_origin(req, res)) {
		pair.aggregate([
			{ $project: { pair: 1, date: 1, fee: 1, status: 1, tradeSpotBuy: 1, tradeSpotSell: 1, lastprice: 1, high: 1, low: 1, volume: 1, udate: 1, pair_id: 1 } },
			{ $sort: { pair_id: 1 } }
		], (err, response) => {
			if (response)
				res.send({ status: true, code: 200, data: response })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.view = (req, res) => {
	if (Common._validate_origin(req, res)) {
		pair.findOne({ _id: req.query.id }, (err, response) => {
			if (response)
				res.send({ status: true, code: 200, data: response })
			else if (!response)
				res.send({ status: false, code: 200, message: 'No results found' })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.show = (req, res) => {
	//if (Common._validate_origin(req, res)) {
		let filter = { status: true }
		filter = Object.keys(req.query).length > 0 ? Object.assign({}, filter, { secondcurrency: req.query.cid.toLowerCase() }) : filter;
		pair.aggregate([
			{ $match: filter },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'currency_data1' } },
			{ $unwind: '$currency_data1' },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'secondcurrency', foreignField: 'symbol', as: 'currency_data2' } },
			{ $unwind: '$currency_data2' },
			{ $project: { pair: '$pair', url: { $concat: ['$firstcurrency', '-', '$secondcurrency'] }, date: 1, lastprice: 1, status: 1, firstcurrency: 1, secondcurrency: 1, high: 1, low: 1, change: 1, volume: 1, firstcurrency_name: '$currency_data1.currency', secondcurrency_name: '$currency_data2.currency', liquidity: 1, binance_price: 1, binance_low: 1, binance_high: 1, binance_change: 1, binance_volume: 1, bot_status: 1, pair_id: 1 } },
			{ $sort: { pair_id: 1 } }
		], (err, response) => {
			//console.log('response--->',response)
			if (response) {
				response = response.map(e => {
					if (e.bot_status && !e.liquidity) {
						e.volume = !e.bot_status ? (e.volume * e.lastprice) : (e.binance_volume * e.binance_price);
						e.change = !e.bot_status ? e.change : e.binance_change;
						e.lastprice = !e.bot_status ? e.lastprice : e.binance_price;
						e.high = !e.bot_status ? e.high : e.binance_high;
						e.low = !e.bot_status ? e.low : e.binance_low;
					} else if (!e.bot_status && e.liquidity) {
						e.volume = !e.liquidity ? (e.volume * e.lastprice) : e.binance_volume;
						e.change = !e.liquidity ? e.change : e.binance_change;
						e.lastprice = !e.liquidity ? e.lastprice : e.binance_price;
						e.high = !e.liquidity ? e.high : e.binance_high;
						e.low = !e.liquidity ? e.low : e.binance_low;
					} else {

					}

					delete e.liquidity;
					delete e.binance_change;
					delete e.binance_volume;
					delete e.binance_high;
					delete e.binance_price;
					delete e.binance_low;
					return e;
				})
				res.status(200).send({ status: true, code: 200, data: response })
			}
			
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
		
	//}
}

module.exports.change = (req, res) => {
	if (Common._validate_origin(req, res)) {
		pair.findOne({ _id: req.params.id }, (err, pair_data) => {
			if (pair_data) {
				let status = !pair_data.status ? true : false;
				pair.updateOne({ _id: pair_data._id }, { $set: { status: status } }, (err, updated) => {
					if (updated.nModified == 1)
						res.send({ status: true, code: 200, message: 'Pair details updated successfully' })
					else if (updated.nModified == 0)
						res.send({ status: false, code: 200, message: 'Already up to date. No changes found' })
					else
						res.send({ status: false, code: 400, message: 'server not found' })
				})
			}
			else if (!pair)
				res.send({ status: false, code: 200, message: 'No results found' })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.remove = (req, res) => {
	if (Common._validate_origin(req, res)) {
		pair.deleteOne({ _id: req.params.id }, (err, response) => {
			if (response)
				res.send({ status: true, code: 200, message: 'pair deleted successfully' })
			else
				res.send({ status: false, code: 400, message: 'pair not deleted' })
		})
	}
}

module.exports.detail = (req, res) => {
	//if (Common._validate_origin(req, res)) {
		let id = req.params.id.replace('_', '/');
		pair.aggregate([
			{ $match: { pair: id.toLowerCase(), status: true } },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'first_data' } },
			{ $unwind: '$first_data' },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'secondcurrency', foreignField: 'symbol', as: 'second_data' } },
			{ $unwind: '$second_data' },
			{ $project: { pair: 1, firstcurrency: 1, change: 1, secondcurrency: 1, description: 1, status: 1, lastprice: 1, high: 1, low: 1, volume: 1, tradeSpotBuy: 1, tradeSpotSell: 1, from_noc: '$first_data.noc_value', to_noc: '$second_data.noc_value', firstcurrency_name: '$first_data.currency', secondcurrency_name: '$second_data.currency', liquidity: 1, binance_price: 1, binance_low: 1, binance_high: 1, binance_change: 1, binance_volume: 1, bot_status: 1 } }
		], (err, response) => {
			if (response) {
				response = response.map(e => {
					if (e.bot_status && !e.liquidity) {
						e.volume = !e.bot_status ? (e.volume * e.lastprice) : (e.binance_volume * e.binance_price);
						e.change = !e.bot_status ? e.change : e.binance_change;
						e.lastprice = !e.bot_status ? e.lastprice : e.binance_price;
						e.high = !e.bot_status ? e.high : e.binance_high;
						e.low = !e.bot_status ? e.low : e.binance_low;
					} else if (!e.bot_status && e.liquidity) {
						e.volume = !e.liquidity ? (e.volume * e.lastprice) : e.binance_volume;
						e.change = !e.liquidity ? e.change : e.binance_change;
						e.lastprice = !e.liquidity ? e.lastprice : e.binance_price;
						e.high = !e.liquidity ? e.high : e.binance_high;
						e.low = !e.liquidity ? e.low : e.binance_low;
					} else {

					}

					if (e.secondcurrency == 'usd') {
						e.lastprice = parseFloat(e.lastprice);
						e.high = parseFloat(e.high);
						e.low = parseFloat(e.low);
						e.volume = parseFloat(e.volume);
					} else {
						e.lastprice = parseFloat(e.lastprice);
						e.high = parseFloat(e.high);
						e.low = parseFloat(e.low);
						e.volume = parseFloat(e.volume);
					}

					delete e.liquidity;
					delete e.binance_change;
					delete e.binance_volume;
					delete e.binance_high;
					delete e.binance_price;
					delete e.binance_low;
					return e;
				})
				res.status(200).send({ status: true, code: 200, data: response[0] })
			}
			else if (!response)
				res.status(201).send({ status: false, code: 201, message: 'No results found' })
			else
				res.status(401).send({ status: false, code: 401, message: 'server not found' })
		})
	//}
}

module.exports.update_all = (req, res) => {
	if (Common._validate_origin(req, res)) {
		pair.updateMany({}, { $set: { status: req.params.status } }, (err, response) => {
			if (response.nModified == 0)
				res.send({ status: true, code: 200, message: 'No changes found' })
			else if (response.nModified > 0)
				res.send({ status: true, code: 200, message: 'Pair updated ' + response.nModified + '.' })
			else
				res.send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.update = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		let avail = await pair.findOne({ pair: req.body.pair.toLowerCase() }).exec();
		if (req.body._id == undefined || req.body._id == null || req.body._id == '') {
			if (avail)
				res.send({ status: false, code: 400, message: 'Pair already exists' })
			else {
				pair.create(req.body, (err, created) => {
					if (created)
						res.send({ status: true, code: 200, message: 'Pair details updated successfully' })
					else if (!created)
						res.send({ status: false, code: 400, message: 'Pair details not updated' })
					else
						res.send({ status: false, code: 400, message: 'server not found' })
				})
			}
		}
		else {
			if (avail.bot_status == true || avail.liquidity == true) {
				req.body.binance_price = req.body.lastprice;
			}
			pair.updateOne({ _id: req.body._id }, { $set: req.body }, async (err, response) => {
				if (response.nModified == 1) {
					if (req.body.pair == "noc/usd" && avail.lastprice !== parseFloat(req.body.lastprice)) {
						var allCoin = await currency.find({ symbol: { $nin: ['noc', 'usd'] }, status: true }, { currency: 1, id: 1, symbol: 1 }).exec();
						var pairResults = await pair.find({ status: true, pair: { $nin: ['noc/usd', 'usd/noc'] } }).exec()
						pairResults = pairResults.filter(e => { return e.firstcurrency.toLowerCase() == "noc" || e.secondcurrency.toLowerCase() == "noc" })
						var ids = allCoin.map(e => { return e.id });
						if (pairResults.length > 0) {
							commonHelper._get_priceList(ids, 'usd', (priceResult) => {
								if (priceResult.status) {
									var index = 0;
									updateNocDatas(pairResults, priceResult.data, index, req.body, allCoin, (result) => {
										return;
									})
								}
							})
						}
					}
					res.send({ status: true, code: 200, message: 'Pair details updated successfully' })
				}
				else if (response.nModified == 0)
					res.send({ status: false, code: 200, message: 'Already up to date. No changes found' })
				else
					res.send({ status: false, code: 400, message: 'server not found' })
			})
		}
	}
}

module.exports.pair_detail = (req, res) => {
	if (Common._validate_origin(req, res)) {
		pair.aggregate([{ $match: { status: true } }, { $project: { pair: 1, high: 1, low: 1, volume: 1, change: 1, lastprice: 1, url: { $concat: ['$firstcurrency', '-', '$secondcurrency'], liquidity: 1, binance_price: 1, binance_low: 1, binance_high: 1, binance_change: 1, binance_volume: 1, bot_status: 1 } } }], (err, response) => {
			if (response.length > 0) {
				response = response.map(e => {
					if (e.bot_status && !e.liquidity) {
						e.volume = !e.bot_status ? (e.volume * e.lastprice) : (e.binance_volume * e.binance_price);
						e.change = !e.bot_status ? e.change : e.binance_change;
						e.lastprice = !e.bot_status ? e.lastprice : e.binance_price;
						e.high = !e.bot_status ? e.high : e.binance_high;
						e.low = !e.bot_status ? e.low : e.binance_low;
					} else if (!e.bot_status && e.liquidity) {
						e.volume = !e.liquidity ? (e.volume * e.lastprice) : e.binance_volume;
						e.change = !e.liquidity ? e.change : e.binance_change;
						e.lastprice = !e.liquidity ? e.lastprice : e.binance_price;
						e.high = !e.liquidity ? e.high : e.binance_high;
						e.low = !e.liquidity ? e.low : e.binance_low;
					} else {

					}
					if (e.secondcurrency == 'usd') {
						e.lastprice = parseFloat(e.lastprice.toFixed(2));
						e.high = parseFloat(e.high.toFixed(2));
						e.low = parseFloat(e.low.toFixed(2));
						e.volume = parseFloat(e.volume.toFixed(2));
					} else {
						e.lastprice = parseFloat(e.lastprice.toFixed(8));
						e.high = parseFloat(e.high.toFixed(8));
						e.low = parseFloat(e.low.toFixed(8));
						e.volume = parseFloat(e.volume.toFixed(8));
					}

					delete e.liquidity;
					delete e.binance_change;
					delete e.binance_volume;
					delete e.binance_high;
					delete e.binance_price;
					delete e.binance_low;
					return e;
				})
				socket.sendmessage('pair_list', { status: true, code: 200, data: response[0] })
			}
			else if (response.length == 0)
				socket.sendmessage('pair_list', { status: false, code: 200, message: 'No orders found' })
			else
				socket.sendmessage('pair_list', { status: false, code: 200, message: 'Server not found' })
		})
	}
}

module.exports.market_price = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		let filter = {};
		if (req.query.pair == undefined || req.query.pair == null || req.query.pair == '')
			filter = { status: true }
		else
			filter = { status: true, pair: req.query.pair }

		let pair_data = await pair.findOne(filter).exec()
		if (pair_data) {
			let currency_data = await currency.findOne({ symbol: req.query.pair.split('/')[0].toLowerCase() }, { currency: 1 }).exec();
			if (currency_data) {
				request.get('https://api.coingecko.com/api/v3/simple/price?ids=' + currency_data.currency + '&vs_currencies=' + req.query.pair.split('/')[1].toLowerCase(), (err, response, body) => {
					if (body) {
						let data = JSON.parse(body);
						socket.sendmessage('market-price', { status: true, code: 200, data: { firstcurrency_symbol: req.query.pair.split('/')[0].toLowerCase(), secondcurrency_symbol: req.query.pair.split('/')[1].toLowerCase(), firstcurrency: 1, secondcurrency: data[currency_data.currency.toLowerCase()][req.query.pair.split('/')[1].toLowerCase()] } })
					}
					else
						socket.sendmessage('market-price', { status: false, code: 400, message: 'No results found' })
				})
			}
			else
				socket.sendmessage('market-price', { status: false, code: 400, message: 'no results found' })
		}
		else
			socket.sendmessage('market-price', { status: false, code: 400, message: 'pair not found' })
	}
}

module.exports.pair_currency = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var currency_list = await currency.find({ status: true }, { currency: 1, symbol: 1, _id: 0 }).exec();
		var response = [{ currency: 'All' }, { currency: 'noc' }, { currency: 'btc' }, { currency: 'eth' }, { currency: 'usdt' }];
		if (req.query.currency !== undefined && req.query.currency !== null && req.query.currency !== '' && req.query.currency.toLowerCase() == 'inr') {
			response.push({ currency: 'usd' })
		};
		res.status(200).send({ status: true, code: 200, data: response, currency: currency_list })
	}
}

function update_pair() {
	pair.find({ status: true }, { pair: 1 }, (err, pair_data) => {
		if (pair_data.length > 0) {
			var i = 0;
			update_market_data(pair_data, i, (response) => {
				return;
			})
		}
	})
}

async function update_market_data(pair, index, cb) {
	var d = new Date();
	var y = new Date((d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + (d.getDate() - 1) + 'T' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds()).toString());
	var volume = await order.aggregate([{ $match: { pair: pair[index].pair } }, { $group: { _id: '$pair', amount: { $sum: '$amount' } } }, { $project: { amount: '$amount', _id: 0 } }]).exec();
	trade.aggregate([{ $match: { pair: pair[index].pair } }, { $group: { _id: '$pair', high: { $max: '$price' }, low: { $min: '$price' } } }, { $project: { _id: 0, high: '$high', low: '$low' } }], (err, update_pair) => {
		if (update_pair.length > 0) {
			pair.updateOne({ pair: pair[index].pair }, { $set: { high: update_pair[0].high, low: update_pair[0].low, volume: volume[0].amount } }, (err, update_trade) => {
				if (pair.length != index + 1) {
					index = index + 1;
					update_market_data(pair, index, cb)
				} else
					cb({ status: true })
			})
		} else {
			if (pair.length != index + 1) {
				index = index + 1;
				update_market_data(pair, index, cb)
			} else
				cb({ status: true })
		}
	})
}

async function updateNocDatas(pairResults, priceResult, index, inr_pair, coin_datas, cb) {
	var current_pair = pairResults[index], coinInfo = {}, coinValue = 0, lastprice = 0;
	if (current_pair.firstcurrency.toLowerCase() == 'noc') {
		coinInfo = coin_datas.find(e => { return e.symbol == current_pair.secondcurrency.toLowerCase() });
		coinValue = priceResult[coinInfo.id]['usd'];
		lastprice = parseFloat((inr_pair.lastprice / coinValue).toFixed(8))
	} else {
		coinInfo = coin_datas.find(e => { return e.symbol == current_pair.firstcurrency.toLowerCase() });
		coinValue = priceResult[coinInfo.id]['inr'];
		lastprice = parseFloat((coinValue / inr_pair.lastprice).toFixed(8))
		var update_noc_value = await currency.updateOne({ symbol: current_pair.firstcurrency.toLowerCase() }, { $set: { noc_value: lastprice } }).exec();
	}

	if (current_pair.pair == "noc/btc") {
		var update_btc_value = await currency.updateOne({ symbol: "noc" }, { $set: { btc_value: lastprice } }).exec();
	}
	var updated_data = { marketprice: lastprice, lastprice: lastprice, binance_price: lastprice };
	pair.updateOne({ pair: current_pair.pair }, { $set: updated_data }, (err, updates) => {
		if (pairResults.length !== index + 1)
			updateNocDatas(pairResults, priceResult, ++index, inr_pair, coin_datas, cb)
		else
			cb({ status: true })
	})
}

async function updateNocValue(price) {
	var noc_value = parseFloat((1 / price).toFixed(8))
	var update_currency = await currency.updateOne({ symbol: "usd" }, { $set: { noc_value: noc_value } }).exec();
}