var express = require('express'),
	cron = require('node-cron'),
	Async = require('async'),
	getJSON = require('get-json'),
	mongoose = require('mongoose');

var block = require('../model/blocklist'),
	currency = require('../model/currency'),
	fees = require('../model/fees'),
	pair = require('../model/pair'),
	user = require('../model/user'),
	history = require('../model/history'),
	trade = require('../model/trade'),
	wallet = require('../model/wallet'),
	stackWalletDB = require('../model/stack-wallet'),
	borrowWalletDB = require('../model/borrow-wallet'),
	stack = require('../model/stack'),
	stack_history = require('../model/stack-history');

var Helper = {
	Request: require('../helper/2fa'),
	Auth: require('../helper/auth'),
	Helper: require('../helper/helper')
};

const common = require('../helper/db2');
const p2porderDB = common.getSecondaryDB().model('orderp2p');

var socket_config = require('../helper/config');

var router = express.Router();

router.get('/update-coin-price', (req, res) => {
	update_coin_Price();
	res.status(201).send({ status: true, code: 200, data: "success" })
})

module.exports = router;

cron.schedule('*/30 * * * *', () => {
	remove_block_list()
	update_user_level()
	remove_sessions()
})

cron.schedule('*/60 * * * *', () => {
	get_circulating_supply()
	update_coin_Price()
})


async function remove_block_list() {
	block.find({ status: true }, (err, response) => {
		if (response.length > 0) {
			var index = 0;
			unblock_ip(response, index, (result) => {
				return;
			})
		} else
			return;
	})
}

async function unblock_ip(ip_list, index, cb) {
	var current_data = ip_list[index];
	var cur_date = new Date();
	var difference = parseInt((cur_date.getTime() - current_data.date.getTime()) / (1000 * 60 * 60 * 24));
	if (difference >= 1) {
		var update_result = await block.updateOne({ _id: current_data._id }, { $set: { status: false } }).exec();
	}

	if (ip_list.length !== index + 1)
		unblock_ip(ip_list, ++index, cb)
	else
		cb({ status: true })
}


async function update_user_level() {
	user.find({}, { email: 1, level: 1, type: 1, usertype: 1, cronExecuted: 1, createdAt: 1 }, (err, user) => {
		if (user.length > 0) {
			var i = 0;
			change_user(user, i, (updates) => { return updates; })
		} else
			return 0;
	})
}

async function change_user(user_data, index, cb) {
	var cur_user = user_data[index];
	if (cur_user.cronExecuted == undefined) {
		var update_user = await user.updateOne({ _id: cur_user._id }, { $set: { cronExecuted: cur_user.createdAt } }).exec();
		cur_user.cronExecuted = user_data.createdAt;
	}
	var cur_date = new Date()
	var to = Helper.Helper.dateToYMD(cur_date) + 'T00:00:00.000Z';
	var buy_btc = await trade.aggregate([{ $match: { userId: user._id, status: { $in: ['filled', 'partial'] }, date: { $gte: new Date(user.cronExecuted), $lt: new Date(to) } } }, { $group: { _id: '$firstcurrency', amount: { $sum: '$amount' } } }, { $lookup: { from: 'YVycmVuYk', localField: '_id', foreignField: 'symbol', as: 'currency_data' } }, { $unwind: '$currency_data' }, { $project: { total: { $multiply: ['$amount', '$currency_data.btc_value'] } } }]).exec();
	var total = buy_btc.length > 0 ? buy_btc.map(function (element) { return element.total }).reduce((a, b) => a + b, 0).toFixed(8) : 0;
	var filter = { type: cur_user.type, trade_volume: { $gte: total } };
	fees.aggregate([{ $match: filter }, { $sort: { level: 1 } }], async (err, levels) => {
		if (levels.length > 0 && cur_user.level < 9) {
			var update_level = await user.updateOne({ email: cur_user.email }, { $set: { level: cur_user.level + 1, cronExecuted: new Date() } }).exec();
		}

		if (user_data.length != index + 1)
			change_user(user_data, ++index, cb);
		else
			cb({ status: true })
	})
}

async function get_result(user, cur_date, cb) {
	user.cronExecuted = user.cronExecuted == undefined ? user.createdAt : user.cronExecuted;
	Async.parallel({
		trade_result: function (cb) {
			trade.aggregate([{ $match: { userId: user._id, status: { $in: ['filled', 'partial'] }, date: { $gte: new Date(user.cronExecuted), $lt: new Date(to) } } }, { $group: { _id: '$firstcurrency', amount: { $sum: '$amount' } } }, { $lookup: { from: 'YVycmVuYk', localField: '_id', foreignField: 'symbol', as: 'currency_data' } }, { $unwind: '$currency_data' }, { $project: { total: { $multiply: ['$amount', '$currency_data.btc_value'] } } }]).exec(cb)
		},
	}, (err, response) => {
		if (response) {
			var total = response.trade_result.length > 0 ? response.trade_result.map(function (element) { return element.total }).reduce((a, b) => a + b, 0).toFixed(8) : 0;
			cb({ result: total });
		} else
			cb({ result: 0, wallet_data: { currency: 'noc', amount: 0, hold: 0 } })
	})
}


async function remove_sessions() {
	var historyData = await history.find({ status: true }).exec();
	if (historyData.length > 0) {
		var index = 0;
		deactivate_session(historyData, index, (result) => {
			return
		})
	}
}

async function deactivate_session(historyData, index, cb) {
	Helper.Auth.validate_session(historyData[index], async (result) => {
		if (!result.status) {
			var update_data = await history.updateOne({ _id: historyData[index]._id }, { $set: { status: false } }).exec();
			socket_config.sendmessage('timeout', { status: true, token: historyData[index].access_token, message: 'Session Timeout' })
		}
		if (historyData.length != index + 1)
			deactivate_session(historyData, ++index, cb)
		else
			cb({ status: true })
	})
}

async function get_circulating_supply() {
	var coinData = await currency.find({ type: 'crypto', symbol: { $nin: ['noc'] }, status: true }, { id: 1, symbol: 1, currency: 1 }).exec()
	var mapped_data = coinData.map(e => { return e.id });
	Helper.Request._get_marketData(mapped_data, (result) => {
		if (result.status) {
			var index = 0;
			update_circulating_supply(coinData, result.data, index, (result) => {
				return;
			})
		} else
			return
	})
}

async function update_circulating_supply(coinData, result, index, cb) {
	var current_coin = coinData[index];
	var coinDetails = result.find(e => { return e.id == current_coin.id });
	var update_currency = await currency.updateOne({ symbol: current_coin.symbol }, { $set: { circulating_supply: coinDetails['circulating_supply'] } }).exec();

	if (coinData.length != index + 1)
		update_circulating_supply(coinData, result, ++index, cb)
	else
		cb({ status: true })
}

async function update_coin_Price() {
	var allCoin = await currency.find({ symbol: { $nin: ['noc', 'inr'] }, status: true }, { currency: 1, id: 1, symbol: 1 }).exec();
	var ids = allCoin.map(e => { return e.id });
	Helper.Request._get_pricelist(ids, 'btc%2Cinr', async (priceResult) => {
		if (priceResult.status) {
			var index = 0;
			var Inr_value = priceResult.data['bitcoin']['inr'];
			inr_btc_value = parseFloat((1 / Inr_value).toFixed(8));
			var update_inr = await currency.updateOne({ symbol: "inr" }, { $set: { btc_value: inr_btc_value } }).exec();
			update_btc_value(allCoin, priceResult.data, index, (result) => {
				return;
			})
		}
	})
}

async function update_btc_value(coin_data, price_data, index, cb) {
	var current_coin = coin_data[index];
	var coinValue = price_data[current_coin.id]['btc'];
	currency.updateOne({ symbol: current_coin.symbol }, { $set: { btc_value: coinValue } }, (err, updated) => {
		if (coin_data.length !== index + 1)
			update_btc_value(coin_data, price_data, ++index, cb)
		else
			cb({ status: true })
	})
}

//market price updation
cron.schedule('*/5 * * * *', () => {
	currency.find({ "type": "crypto", "status": true }, (err, getlist) => {
		if (!err && getlist.length > 0) {
			let count = 0;
			for (let i = 0; i < getlist.length; i++) {
				getJSON("https://api.coingecko.com/api/v3/simple/price?ids=" + getlist[i].id + "&vs_currencies=jpy,inr,usd,cny,gbp,cad,aud,thb,sar,sgd,aed,eur", (err, getdata) => {
					let obj = getdata[getlist[i].id];
					currency.updateOne({ "_id": mongoose.Types.ObjectId(getlist[i]._id) }, { "$set": { "marketPrice": obj } }, (err, updated) => {
						count++;
						if (count == getlist.length) {
							console.log("Market price updation completed")
						}
					})
				})
			}
		}
	})
})

cron.schedule('*/10 * * * *', ()=>{
	p2porderDB.find({"$or":[{"status":0}, {"status":2}]}, (err, getorders)=>{
		if(!err && getorders.length > 0){
			let count = 0;
			marketupdation(getorders, 0);
		}else{
			console.log("Market price updation already updated")
		}
	})
})

function marketupdation(getorders, i){
	currency.findOne({"symbol":getorders[i].firstCurrency}, (err, getcur)=>{
		let marketprice = getcur.marketPrice[getorders[i].secondCurrency];
		let price;
		if(getorders[i].marginPercentage > 0){
			let fee = marketprice * getorders[i].marginPercentage/ 100 ;
			price = marketprice + fee;
		}else{
			let fee = marketprice * (+getorders[i].marginPercentage)/ 100 ;
			price = marketprice - fee;
		}
		p2porderDB.findOne({"_id":mongoose.Types.ObjectId(getorders[i]._id)}, {"$set":{"marketPrice":marketprice, "price":price}}, (err, updated)=>{
			i++;
			if(i == getorders.length){
				console.log("Market price updated in p2p order collection")
			}else{
				marketupdation(getorders, i);
			}
		})
	})
}


//user daily stack data
cron.schedule('* * */24 * * *', () => {
	stack_rewards()
});

function stack_rewards() {
	stack.find({ 'status': 'active' }, (err, stack_data) => {
		for (var i = 0; i < stack_data.length; i++) {
			var data = stack_data[i]
			stackWalletDB.findOne({ 'userId': data.userId, 'wallet.currency': data.currency }, { 'wallet.$': 1 }, (err, wallet_data) => {
				if (!err && wallet_data != null) {
					if (data.remaining_days > 0) {
						stack.updateOne({ '_id': data._id }, {
							$set: {
								remaining_days: data.remaining_days - 1,
								completed_days: data.completed_days + 1,
								total_rewards: data.total_rewards + daily_rewards,
							}
						}, (err, stack_update) => {
							if (!err && stack_update) {
								c_date = data.completed_days + 1;
								completed_days = `day ${c_date}`;
								stack_history.updateOne({ 'userId': data.userId, 'stackId': data._id, 'day': completed_days }, {
									$set: {
										status: "completed"
									}
								}, (err, his_update) => {
									if (err || his_update == null) {
										console.log("stack history didn't be updated")
									}
								})
							}
						})

					}
					else {
						stack.updateOne({ '_id': data._id }, {
							$set: {
								status: 'completed',
							}
						}, (err) => {
							if (!err) {
								stackWalletDB.updateOne({ 'userId': data.userId, 'wallet.currency': data.currency }, {
									$set: {
										"wallet.$.amount": wallet_data.wallet[0].amount + data.return_amount,
									}
								}, (err) => {
									if (err) {
										console.log("error")
									}
								})
							}
						})
					}
				}
			})
		}
	})
}

//user daily stack data
cron.schedule('* * */24 * * *', () => {
	borrow_cron()
});

function borrow_cron() {
	borrow.find({ 'status': true }, (err, borrow_data) => {
		if (!err && borrow_data != null) {
			var user_id = borrow_data.userId,
				borrow_id = borrow_data._id;
			for (var i = 0; i < borrow_data.length; i++) {
				var data = borrow_data[i]
				if (data.status == true && data.repayment_days > 0) {
					borrow.updateOne({ '_id': data.borrow_id }, {
						$set: {
							"repayment_days": data.repayment_days - 1,
							"completed_days": data.completed_days + 1,
						}
					}, (err) => {
						if (err) {
							console.log("error")
						}
					})
				}
				else {
					borrow.updateOne({ '_id': borrow_id }, {
						$set: {
							status: false,
						}
					}, (err, status_updated) => {
						if (!err && status_updated) {
							borrowWalletDB.findOne({ 'userId': user_id, 'wallet.currency': data.borrow_currency }, { 'wallet.$': 1 }, (err, user_borrow_wallet) => {
								if (!err && user_borrow_wallet) {
									var oneDayInterest = ((data.borrow_amount) * (data.daily_interest_rate)) / 100;
									var totalInterest = oneDayInterest * data.completed_days;
									var repay_amount = data.borrow_amount + totalInterest;
									borrowWalletDB.updateOne({ 'userId': user_id, 'wallet.currency': data.borrow_currency }, {
										$set: {
											"wallet.$.amount": user_borrow_wallet.wallet[0].amount - repay_amount
										}
									}, (err, bal_updated) => {
										if (!err && bal_updated) {
											borrowWalletDB.findOne({ 'userId': user_id, 'wallet.currency': data.collateral_currency }, { 'wallet.$': 1 }, (err, user_collateral_wallet) => {
												if (!err && user_collateral_wallet) {
													borrowWalletDB.updateOne({ 'userId': user_id, 'wallet.currency': data.collateral_currency.toLowerCase() }, {
														$set: {
															"wallet.$.amount": user_collateral_wallet.wallet[0].amount + data.collateral_amount,
														}
													}, (err) => {
														if (err) {
															console.log("error")
														}
													})
												}
											})
										}
									})
								}
							})
						}
					})
				}
			}
		}
	})
}