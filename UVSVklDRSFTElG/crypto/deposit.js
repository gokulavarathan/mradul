var cron = require('node-cron'),
	express = require('express'),
	request = require('request'),
	Async = require('async'),
	bitcoin_rpc = require('node-bitcoin-rpc');
const { convertKeysFromSnakeCaseToCamelCase } = require('ripple-lib');

var Helper = require('../../helper/helper'),
	Mailer = require('../../helper/mailer'),
	Crypto = require('../../helper/crypto'),
	Encrypter = require('../../helper/encrypter');

var currency = require('../../model/currency'),
	adminTransfer = require('../../model/admin-transfer'),
	adminWallet = require('../../model/admin-wallet'),
	address = require('../../model/address'),
	crypto = require('../../model/crypto'),
	wallet = require('../../model/wallet');

var _bitcoin = require('../../QRklHLVNFRFWE/QlRDLUNSWVBUTw'),
	_ether = require('../../QRklHLVNFRFWE/RVRILUNSWVBUTw'),
	_tron = require('../../QRklHLVNFRFWE/VFJYLUNSWVBUTw'),
	_binance = require('../../QRklHLVNFRFWE/QkCLUNSWVBUTw'),
	_ripple = require('../../QRklHLVNFRFWE/XRPGHxvganDf'),
	_token = require('../../QRklHLVNFRFWE/VVNEVCDUllQVE'),
	_tronusdt= require('../../QRklHLVNFRFWE/TRoenBAbnvnkinhKl'),
	RippleAPI = require('ripple-lib').RippleAPI,
	api = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' });

var router = express.Router();

module.exports = router;

var explorer = {
	"btc": `https://www.blockchain.com/btc-testnet/tx/`,
	"eth": `https://ropsten.etherscan.io/tx/`,
	"bnb": `https://testnet-explorer.binance.org/txs/`,
	"trx": `https://shasta.tronscan.org/#/transaction/`,
	"xrp": `https://xrpscan.com/ledger/`

	//https://xrpintel.com/api
};

cron.schedule('*/10 * * * *', () => {
	btc()
	eth()
	admin_eth()
	trx()
	bnb()
	usdt()
	xrp()
	trcusdt()

	currency.find({ type: "crypto" }, (err, response) => {
		if (response.length > 0) {
			var index = 0;
			get_coin_details(response, index, (result) => {
				return;
			})
		}
	})
})

async function get_coin_details(coin_data, index, cb) {
	var cur_coin = coin_data[index], details = '';
	if (cur_coin.symbol == "btc")
		details = _bitcoin['btc'].address;
	else if (cur_coin.symbol == "eth")
		details = _ether['eth'].address.slice(1, -1);
	// else if (cur_coin.symbol == "trx")
	// 	details = _tron['trx'].address.slice(1, -1);
	else if (cur_coin.symbol == "xrp")
		details = _ripple['xrp'].address.slice(1, -1);
	else if (cur_coin.symbol == "bnb")
		details = _binance['bnb'].address.slice(1, -1);
	else if (cur_coin.symbol == "trx" || (cur_coin.symbol == "trxusdt" && ["trc10", "trc20"].indexOf(cur_coin.network.toLowerCase()) > -1))
		details = _tron['trx'].address.slice(1, -1);
	else
		details = _ether['eth'].address.slice(1, -1);

	Crypto._get_balance(cur_coin.symbol.toLowerCase(), details, async (result) => {
		if (result.status) {
			var update_wallet = await adminWallet.updateOne({ currency: cur_coin.symbol.toLowerCase() }, { $set: { balance: result.data['result'] } }).exec()
			if (update_wallet.n == 0 && update_wallet.nModified == 0) {
				var create_wallet = await adminWallet.create({ currency: cur_coin.symbol.toLowerCase(), balance: result.data['result'] })
			}
		}
		if (coin_data.length != index + 1)
			get_coin_details(coin_data, ++index, cb)
		else
			cb({ status: true })
	})
}

cron.schedule('*/10 * * * *', () => {
	crypto.find({ movedAdmin: false, ordertype: "receive", status: 1 }, (err, response) => {
		if (response.length > 0) {
			var index = 0;
			send_to_admin(response, index, (result) => {
				return;
			})
		} else
			return
	})
})

async function get_admin_address(coin) {
	var address = '';
	if (coin == "btc")
		address = _bitcoin['btc'].address.slice(1, -1);
	else if (coin == "eth")
		address = _ether['eth'].address.slice(1, -1);
	else if (coin == "btc")
		address = _tron['trx'].address.slice(1, -1);
	else if (coin == "btc")
		address = _ripple['xrp'].address.slice(1, -1);
	else if (coin == "btc")
		address = _binance['bnb'].address.slice(1, -1);
	else if (coin == "usdt")
		address = _ether['eth'].address.slice(1, -1);
	else
		address = address;

	return address;
}

async function send_to_admin(datas, i, cb) {
	var cur_txn = datas[i];
	var details = {
		currency: cur_txn.currency,
		address: cur_txn.receiveaddress,
		amount: cur_txn.actualamount
	}
	console.log('details----------->', details)
	Crypto.transfer_admin(details, async (result) => {
		if (result.status) {
			var receiver = await get_admin_address(cur_txn.currency.toLowerCase())
			var transaction = {
				email: 'admin',
				txnid: result.hash,
				currency: cur_txn.currency,
				ordertype: 'deposit',
				category: 'user',
				type: 'crypto',
				description: 'UserToAdminTransfer',
				sendaddress: cur_txn.receiveaddress,
				receiveaddress: receiver,
				amount: cur_txn.actualamount,
				actualamount: cur_txn.actualamount,
				confirmations: 1,
				status: 1,
				fee: 0,
				mainFee: result.fee,
				mainFee: 0,
				date: new Date()
			};
			var create = await adminTransfer.create(transaction);
			var update_data = await crypto.updateOne({ _id: cur_txn._id }, { $set: { movedAdmin: true } }).exec();
			if (datas.length != i + 1)
				send_to_admin(datas, ++i, cb)
			else
				cb({ status: true })
		} else
			if (datas.length != i + 1)
				send_to_admin(datas, ++i, cb)
			else
				cb({ status: true })
	})
}

async function btc() {
	var datas = await address.aggregate([
		{ $match: { currency: 'btc' } },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $project: { address: 1, tag: 1, userId: 1, email: '$user_data.email', firstname: '$user_data.firstname' } }
	]).exec();
	var currency_data = await currency.findOne({ symbol: 'btc' }).exec()

	var host = _bitcoin['btc'].host.slice(1, -1);
	var port = _bitcoin['btc'].port;
	var user = _bitcoin['btc'].user.slice(1, -1);
	var pass = _bitcoin['btc'].password.slice(1, -1);
	bitcoin_rpc.init(host, port, user, pass)
	bitcoin_rpc.call('listtransactions', ['*', 100], function (err, response) {
		if (response && response.result.length > 0) {
			var our_address = datas.map(result => { return result.address; });
			var admin_transfer_result = response.result.filter(e => { return e.address == _bitcoin['btc'].address.slice(1, -1) });
			response.result = response.result.filter(e => { return our_address.indexOf(e.address) !== -1 })
			var i = 0;
			if (admin_transfer_result.length > 0) {
				_btc_wallet_admin(admin_transfer_result, i, 'btc', (cb) => {
					return;
				});
			}

			if (response.result.length > 0) {
				check_data(response.result, datas, currency_data, i, (cb) => {
					return;
				})
			}
		} else
			return;
	})
}

async function _btc_wallet_admin(results, index, coin, cb) {
	var cur_txn = results[index];
	if (cur_txn !== undefined && cur_txn !== null && cur_txn !== '') {
		if (_bitcoin['btc'].address.slice(1, -1) === cur_txn.address) {
			var txnid = cur_txn.txid;
			adminTransfer.findOne({ currency: coin, txnid: txnid, ordertype: 'deposit' }, async (err, avail) => {
				if (!avail) {
					var amount = cur_txn.amount;
					var datas = {
						email: 'admin',
						txnid: txnid,
						currency: coin,
						ordertype: 'deposit',
						category: 'self',
						type: 'crypto',
						description: 'Transaction Success',
						sendaddress: 'not provided',
						receiveaddress: _bitcoin[coin].address.slice(1, -1),
						amount: amount,
						actualamount: amount,
						confirmations: cur_txn.confirmations,
						status: 1,
						fee: 0,
						mainFee: 0,
						date: new Date()
					};

					var generate = await adminTransfer.create(datas)
					if (results.length !== index + 1)
						_btc_wallet_admin(results, ++index, coin, cb)
					else
						cb({ status: true })
				} else {
					if (results.length !== index + 1)
						_btc_wallet_admin(results, ++index, coin, cb)
					else
						cb({ status: true })
				}
			})
		} else {
			if (results.length !== index + 1)
				_btc_wallet_admin(results, ++index, coin, cb)
			else
				cb({ status: true })
		}
	} else {
		if (results.length !== index + 1)
			_btc_wallet_admin(results, ++index, coin, cb)
		else
			cb({ status: true })
	}
}

async function check_data(transaction_list, datas, coin_data, index, cb) {
	var transaction = transaction_list[index];
	var user_data = datas.find(e => { return e.address == transaction.address });
	if (user_data) {
		var wallet_data = await wallet.findOne({ userId: user_data.userId, 'wallet.currency': coin_data.symbol.toLowerCase() }, { 'wallet.$': 1 }).exec();
		var user_email = Encrypter.decrypt_data(user_data.email);
		var transaction_data = {
			userId: user_data.userId,
			blockhash: transaction.blockhash,
			hash: transaction.txid,
			currency: coin_data.symbol,
			ordertype: 'receive',
			receiveaddress: user_data.address,
			amount: transaction.amount,
			actualamount: transaction.amount,
			description: 'Transaction success',
			status: 1,
			explorer: `${ explorer[coin_data.symbol.toLowerCase()] }${ transaction.txid }`,
			movedAdmin: true,
			date: new Date()
		};
		crypto.findOne({ hash: transaction_data.hash, currency: transaction_data.currency, ordertype: 'receive' }, async (err, exist) => {
			if (!exist) {
				var generate_record = await crypto.create(transaction_data);
				var wallet_amount = wallet_data.wallet[0].amount + transaction_data.actualamount;
				var update_wallet = await wallet.updateOne({ userId: transaction_data.userId, 'wallet.currency': transaction_data.currency }, { $set: { 'wallet.$.amount': wallet_amount } }).exec()
				var mail_data = {
					"##coin##": transaction_data.currency.toUpperCase(),
					"##user##": user_data.firstname,
					"##txnid##": transaction_data.hash,
					"##amount##": transaction_data.actualamount,
					"##state##": "Success",
					"##message##": transaction_data.description,
					"##date##": Helper.dateToDMY(new Date())
				}, subject_data = { "##coin##": transaction_data.currency.toUpperCase() };
				Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })
				if (transaction_list.length != index + 1)
					check_data(transaction_list, datas, coin_data, ++index, cb)
				else
					cb({ status: true, message: 'updated' })
			}
			else {
				if (transaction_list.length != index + 1)
					check_data(transaction_list, datas, coin_data, ++index, cb)
				else
					cb({ status: true, message: 'updated' })
			}
		})
	}
	else {
		if (transaction_list.length != index + 1)
			check_data(transaction_list, datas, coin_data, ++index, cb)
		else
			cb({ status: true, message: 'updated' })
	}
}

async function bnb() {
	var coin_data = await currency.findOne({ symbol: "bnb" }).exec();
	var addr_list = await address.aggregate([
		{ $match: { currency: "bnb" } },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $project: { address: 1, tag: 1, userId: 1, email: '$user_data.email', firstname: '$user_data.firstname', phisingCode: '$user_data.phisingCode', phisingCodeStatus: '$user_data.phisingCodeStatus', profileUpdated: '$user_data.profileUpdated', usr_currency: '$user_data.currency' } }
	]).exec();
	if (addr_list.length > 0) {
		var options = {
			"url": `https://dex.binance.org/api/v1/transactions?address=${ _binance['bnb'].address.slice(1, -1) }`,
			"method": "GET",
			"headers": { "Content-Type": "application/json" },
		}
		request(options, (error, response, body) => {
			if (body) {
				var data = JSON.parse(body)
				if (data.tx !== undefined && data.tx !== null && data.tx !== '' && data.tx.length > 0) {
					var index = 0;
					var user_tags = addr_list.map(e => { return e.tag });
					var admin_details = data.tx.filter(e => { return user_tags.indexOf(e.memo) == -1 })
					var user_details = data.tx.filter(e => { return user_tags.indexOf(e.memo) > -1 })
					if (admin_details.length > 0) {
						_bnb_wallet_admin(admin_details, index, coin_data.symbol, (admin_result) => {
							return;
						})
					}
					if (user_details.length > 0) {
						update_bnb_transaction(user_details, index, coin_data, addr_list, (result) => {
							return;
						})
					}
				} else
					return
			} else
				return
		})
	} else {
		return;
	}
}

async function _bnb_wallet_admin(results, index, coin, cb) {
	var cur_txn = results[index];
	if (cur_txn.memo == undefined || cur_txn.memo == null || cur_txn.memo == '' || _binance[coin].tag.slice(1, -1) === cur_txn.memo) {
		var txnid = cur_txn.txHash;
		adminTransfer.findOne({ currency: coin, txnid: txnid, ordertype: 'deposit' }, async (err, avail) => {
			if (!avail) {
				var amount = parseFloat(cur_txn.value);
				var datas = {
					email: 'admin',
					txnid: txnid,
					currency: coin,
					ordertype: 'deposit',
					category: 'self',
					type: 'crypto',
					description: 'Transaction Success',
					sendaddress: cur_txn.fromAddr,
					receiveaddress: _binance[coin].address.slice(1, -1),
					amount: amount,
					actualamount: amount,
					confirmations: cur_txn.confirmations,
					status: 1,
					fee: 0,
					mainFee: 0,
					date: new Date()
				};

				var generate = await adminTransfer.create(datas)
				if (results.length !== index + 1)
					_bnb_wallet_admin(results, ++index, coin, cb)
				else
					cb({ status: true })
			} else {
				if (results.length !== index + 1)
					_bnb_wallet_admin(results, ++index, coin, cb)
				else
					cb({ status: true })
			}
		})
	} else {
		if (results.length !== index + 1)
			_bnb_wallet_admin(results, ++index, coin, cb)
		else
			cb({ status: true })
	}
}

async function update_bnb_transaction(list, index, coin_info, address_data, cb) {
	var cur_txn = list[index];
	var details = address_data.find(e => { return cur_txn.memo == e.tag });
	if (!details) {
		var wallet_data = await wallet.findOne({ userId: details.userId, 'wallet.currency': 'bnb' }, { 'wallet.$': 1 }).exec()
		var user_email = Encrypter.decrypt_data(details.email);
		var received_amount = parseFloat(cur_txn.value);
		var transaction = {
			userId: details.userId,
			hash: cur_txn.txHash,
			currency: 'bnb',
			ordertype: 'receive',
			receiveaddress: cur_txn.toAddr,
			sendaddress: cur_txn.fromAddr,
			amount: received_amount,
			receiverTag: cur_txn.memo,
			actualamount: received_amount,
			description: 'Transaction success',
			explorer: `${ explorer["bnb"] }${ cur_txn.txHash }`,
			status: 1,
			date: new Date(),
			movedAdmin: true,
		};
		crypto.findOne(transaction.hash, async (err, created) => {
			if (!created) {
				var create = await crypto.create(transaction);
				var wallet_amount = wallet_data.wallet[0].amount + transaction.actualamount;
				var update_wallet = await wallet.updateOne({ userId: details.userId, 'wallet.currency': 'bnb' }, { $set: { 'wallet.$.amount': wallet_amount } }).exec()
				var mail_data = {
					"##coin##": coin_info.symbol.toUpperCase(),
					"##user##": details.firstname,
					"##txnid##": transaction.hash,
					"##amount##": transaction.actualamount,
					"##state##": "Success",
					"##message##": transaction.description,
					"##date##": Helper.dateToDMY(transaction.date)
				}, subject_data = { "##coin##": coin_info.symbol.toUpperCase() };
				Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })
			} else {
				if (list.length != index + 1)
					update_bnb_transaction(list, ++index, coin_info, address_data, cb)
				else {
					update_block_number('bnb', cur_txn.blockHeight)
					cb({ status: true })
				}
			}
		})
	} else {
		if (list.length != index + 1)
			update_bnb_transaction(list, ++index, coin_info, address_data, cb)
		else {
			update_block_number('bnb', cur_txn.blockHeight)
			cb({ status: true })
		}
	}
}


async function trx() {
	var coin_info = await currency.findOne({ symbol: 'trx' }).exec();
	var addressData = await address.aggregate([
		{ $match: { currency: 'trx' } },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $project: { address: 1, tag: 1, userId: 1, email: '$user_data.email', firstname: '$user_data.firstname' } }
	]).exec();
	if (addressData.length > 0) {
		var index = 0;
		get_trx_transaction(addressData, index, coin_info, (result) => {
			return;
		})
	}
}

// async function get_trx_transaction(addressData, index, coin_info, cb) {
// 	var curAddress = addressData[index];
// 	request(`https://shastapi.tronscan.org/api/transaction?count=true&limit=20&start=${ coin_info.latest_block }&address=${ curAddress.address }`, (error, response, body) => {
// 		if (body) {
// 			var data = JSON.parse(body);
// 			if (data.data !== undefined && data.data !== null && data.data !== '') {
// 				var filterData = data.data.filter(e => { return e.toAddress == curAddress.address }).filter(e => { return e.tokenInfo.tokenName == 'trx' });
// 				if (filterData.length > 0) {
// 					var i = 0;
// 					update_trx_transaction(curAddress, filterData, i, coin_info, (result) => {
// 						if (addressData.length != index + 1)
// 							get_trx_transaction(addressData, ++index, coin_info, cb)
// 						else
// 							cb({ status: true })
// 					})
// 				} else {
// 					if (addressData.length != index + 1)
// 						get_trx_transaction(addressData, ++index, coin_info, cb)
// 					else
// 						cb({ status: true })
// 				}
// 			} else {
// 				if (addressData.length != index + 1)
// 					get_trx_transaction(addressData, ++index, coin_info, cb)
// 				else
// 					cb({ status: true })
// 			}
// 		} else {
// 			if (addressData.length != index + 1)
// 				get_trx_transaction(addressData, ++index, coin_info, cb)
// 			else
// 				cb({ status: true })
// 		}
// 	})
// }
async function get_trx_transaction(addressData, index, coin_info, cb) {
	var curAddress = addressData[index];
	request(`https://shastapi.tronscan.org/api/transaction?count=true&limit=20&start=$${ coin_info.latest_block }&address=${ curAddress.address }`, (error, response, body) => {
		if (body) {
			var data = JSON.parse(body);
			if (data.data !== undefined && data.data !== null && data.data !== '') {
				var filterData = data.data.filter(e => { return e.toAddress == curAddress.address }).filter(e => { return e.tokenInfo.tokenName == 'trx' });
				if (filterData.length > 0) {
					var i = 0;
					update_trx_transaction(curAddress, filterData, i, coin_info, (result) => {
						if (addressData.length != index + 1)
							get_trx_transaction(addressData, ++index, coin_info, cb)
						else
							cb({ status: true })
					})
				} else {
					if (addressData.length != index + 1)
						get_trx_transaction(addressData, ++index, coin_info, cb)
					else
						cb({ status: true })
				}
				var filterBextData = data.data.filter(e => { return e.toAddress == curAddress.address && contractData.data }).filter(e => { return e.tokenInfo.tokenName == 'trx' });
				if (filterBextData.length > 0) {
					request(`https://api.trongrid.io/v1/accounts/${ curAddress.address }/transactions/trc20?start=${ coin_info.latest_block }&limit=20&contract_address=TUtTUSMH1fMJJyANcrLSNLEbK7sieJeeeK`, (error, response, body) => {
						if (body) {
							var data = JSON.parse(body);
							if (data.data !== undefined && data.data !== null && data.data !== '') {
								var filterData = data.data.filter(e => { return e.to == curAddress.address }).filter(e => { return e.token_info.name == 'BYTEDEX' });
								if (filterData.length > 0) {
									var i = 0;
									update_trcusdt_transaction(curAddress, filterData, i, coin_info, (result) => {
										if (addressData.length != index + 1)
											get_trx_transaction(addressData, ++index, coin_info, cb)
										else
											cb({ status: true })
									})
								} else {
									if (addressData.length != index + 1)
										get_trx_transaction(addressData, ++index, coin_info, cb)
									else
										cb({ status: true })
								}
							} else {
								if (addressData.length != index + 1)
									get_trx_transaction(addressData, ++index, coin_info, cb)
								else
									cb({ status: true })
							}
						} else {
							if (addressData.length != index + 1)
								get_trx_transaction(addressData, ++index, coin_info, cb)
							else
								cb({ status: true })
						}
					})
				} else {
					if (addressData.length != index + 1)
						get_trx_transaction(addressData, ++index, coin_info, cb)
					else
						cb({ status: true })
				}


			} else {
				if (addressData.length != index + 1)
					get_trx_transaction(addressData, ++index, coin_info, cb)
				else
					cb({ status: true })
			}
		} else {
			if (addressData.length != index + 1)
				get_trx_transaction(addressData, ++index, coin_info, cb)
			else
				cb({ status: true })
		}
	})
}


async function update_trx_transaction(userInfo, results, index, coin_info, cb) {
	var transaction = results[index];
	var user_email = Encrypter.decrypt_data(userInfo.email);
	var wallet_data = await wallet.findOne({ userId: userInfo.userId, 'wallet.currency': 'trx' }, { 'wallet.$': 1 }).exec();
	var received_amount = parseFloat(transaction.amount) / 1000000;
	var transaction_data = {
		userId: userInfo.userId,
		blockhash: transaction.hash,
		hash: transaction.hash,
		currency: 'trx',
		ordertype: 'receive',
		receiveaddress: transaction.toAddress,
		sendaddress: transaction.ownerAddress,
		amount: received_amount,
		actualamount: received_amount,
		description: 'Transaction success',
		explorer: `${ explorer["trx"] }${ transaction.hash }`,
		txnid: transaction.block,
		status: 1,
		date: new Date()
	}
	crypto.findOne({ hash: transaction_data.hash, ordertype: 'receive', currency: 'trx' }, async (err, exists) => {
		if (!exists) {
			var generate_record = await crypto.create(transaction_data);
			var wallet_amount = wallet_data.wallet[0].amount + transaction_data.actualamount
			var update_wallet = await wallet.updateOne({ userId: userInfo.userId, 'wallet.currency': 'trx' }, { $set: { 'wallet.$.amount': wallet_amount } }).exec();
			var mail_data = {
				"##coin##": transaction_data.currency.toUpperCase(),
				"##user##": userInfo.firstname,
				"##txnid##": transaction_data.hash,
				"##amount##": transaction_data.actualamount,
				"##state##": "Success",
				"##message##": transaction_data.description,
				"##date##": Helper.dateToDMY(transaction_data.date),
			}, subject_data = { "##coin##": transaction_data.currency.toUpperCase() };
			Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })
		}
		if (results.length !== index + 1)
			update_trx_transaction(userInfo, results, ++index, coin_info, cb)
		else {
			update_block_number('trx', transaction.block)
			cb({ status: true })
		}
	})
}
//trx copy to xrp

async function xrp() {
	// var coin_info = await currency.findOne({symbol:'xrp'}).exec();
	// console.log('coin_info------->',coin_info)
	// var addressData = await address.aggregate([
	// 	{$match:{currency:'xrp'}},
	// 	{$lookup:{from:'MRADULEXG_STEUSE', localField:'userId', foreignField:'_id', as:'user_data'}}, 
	// 	{$unwind:'$user_data'}, 
	// 	{$project:{address:1, tag:1, userId:1, email:'$user_data.email', firstname:'$user_data.firstname'}}
	// ]).exec();
	// console.log('addressData ------->',addressData )
	// if(addressData.length > 0){
	// 	var index = 0;
	// 	get_xrp_transaction(addressData, index, coin_info, (result)=>{
	// 		return;
	// 	})
	// }
	coin = 'xrp';
	Async.parallel({
		datas: function (cb) { address.aggregate([{ $match: { currency: coin } }, { $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } }, { $unwind: '$user_data' }, { $project: { address: 1, tag: 1, userId: 1, email: 1, firstname: '$user_data.firstname', phisingCode: '$user_data.phisingCode', phisingCodeStatus: '$user_data.phisingCodeStatus', profileUpdated: '$user_data.profileUpdated', usr_currency: '$user_data.currency' } }]).exec(cb) },
		currency_data: function (cb) { currency.findOne({ symbol: coin }).exec(cb) }
	}, async (err, responseData) => {
		if (responseData) {
			api.connect().then(async () => {
				var serverInfo = await api.getServerInfo()
				var ledger = serverInfo.completeLedgers.split('-');
				api.getTransactions(_ripple.xrp.address.slice(1, -1), { minLedgerVersion: Number(ledger[0]), maxLedgerVersion: Number(ledger[1]) }).then((transaction) => {
					if (transaction.length > 0) {
						var index = 0, our_address = responseData.datas.map(result => { return result.tag; });
						transaction = transaction.filter(e => { return e.specification.destination['address'] == config[coin].address.slice(1, -1) });
						var admin_details = transaction.filter(e => { return our_address.indexOf(e.specification.destination['tag']) == -1 });
						if (admin_details.length > 0) {
							xrp_admin_transfer(admin_details, index, coin, (results) => { return; })
						}

						var user_details = transaction.filter(e => { return our_address.indexOf(e.specification.destination['tag']) > -1 });
						if (user_details.length > 0) {
							check_data_xrp(user_details, responseData.datas, responseData.currency_data, site_info, index, (results) => { return; })
						}
					}
					api.disconnect()
				}).catch(error => {
					api.disconnect()
				});
			});

		} else
			return
	})
}

async function check_data_xrp(tesnet_data, datas, coin_data, site_info, index, cb) {
	var transaction = tesnet_data[index];
	crypto.findOne({ hash: transaction.id, ordertype: 'receive', currency: coin_data.symbol }, (err, exist) => {
		if (!exist) {
			var user_data = datas.find(e => { return e.address == transaction.to });
			if (user_data) {
				var user_email = Helper.decrypt_data(user_data.email);
				var received_amount = parseFloat(transaction.outcome.deliveredAmount['value']);
				var transaction_data = {
					username: user_data.firstname,
					userId: user_data.userId,
					email: user_email,
					confirmations: 6,
					hash: transaction.id,
					conversion: received_amount * Helper.fiat_values(coin_data.id, user_data.usr_currency.toLowerCase()),
					fiat_symbol: user_data.usr_currency.toLowerCase(),
					currency: coin_data.symbol,
					ordertype: 'receive',
					sendaddress: transaction.specification.source['address'],
					receiveaddress: user_data.address,
					amount: received_amount,
					network: coin_data.network,
					actualamount: received_amount,
					senderTag: transaction.specification.source['tag'],
					receiverTag: transaction.specification.destination['tag'],
					description: 'Transaction success',
					status: received_amount > coin_data.min_deposit ? 1 : 2,
					fee: 0,
					explorer: `${ explorer[coin_data.symbol.toLowerCase()] }${ transaction.hash }`,
					mainFee: 0,
					movedAdmin: true,
					date: new Date()
				};
				if (coin_data.depositReward) {
					transaction_data.depositRewardValue = parseFloat(((transaction_data.actualamount * (coin_data.depositRewardValue / 100)) * coin_data.noc_value).toFixed(8))
				}
				crypto.create(transaction_data, async (err, created) => {
					if (created) {
						update_rewards(coin_data, user_data, created, site_info)
						if (coin_info.depositReward == true && coin_info.depositRewardValue > 0) {
							site_info.bonus_spent_limit = site_info.bonus_spent_limit + transaction_data.depositRewardValue;
						}
						if (created.status == 1) {
							var update_wallet = await wallet.updateOne({ userId: created.userId, 'wallet.currency': created.currency }, { $inc: { 'wallet.$.amount': created.actualamount } }).exec();
							var mail_data = {
								"##coin##": coin_data.symbol.toUpperCase(),
								"##user##": user_data.profileUpdated == true ? `${ user_data.firstname }` : '',
								"##txnid##": created.hash,
								"##from##": created.sendaddress !== "" ? created.sendaddress : "Not provided",
								"##to##": created.receiveaddress,
								"##amount##": `${ created.actualamount } ${ created.currency.toUpperCase() }`,
								"##fee##": `${ created.mainFee } ${ created.currency.toUpperCase() }`,
								"##state##": "Receive",
								"##message##": created.description,
								"##anticode##": user_data.phisingCodeStatus == true ? `Anti-Phishing:${ user_data.phisingCode }` : '',
								"##date##": Helper.dateToDMY(transaction_data.date)
							}, subject_data = {
								"##coin##": coin_data.symbol.toUpperCase(),
							};
							Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })
						}

						if (tesnet_data.length != index + 1)
							check_data_xrp(tesnet_data, datas, coin_data, site_info, ++index, cb)
						else
							cb({ status: true, message: 'updated' })
					} else {
						if (transaction.confirmations < 6) {
							var updateCrypto = await crypto.updateOne({ hash: transaction_data.hash }, { $set: { confirmations: transaction_data.confirmations } }).exec();
						}
						if (tesnet_data.length != index + 1)
							check_data_xrp(tesnet_data, datas, coin_data, site_info, ++index, cb)
						else
							cb({ status: true, message: 'updated' })
					}
				})
			} else {
				if (tesnet_data.length != index + 1)
					check_data_xrp(tesnet_data, datas, coin_data, site_info, ++index, cb)
				else
					cb({ status: true, message: 'updated' })
			}
		}
		else {
			if (tesnet_data.length != index + 1)
				check_data_xrp(tesnet_data, datas, coin_data, site_info, ++index, cb)
			else
				cb({ status: true, message: 'updated' })
		}
	})
}


async function xrp_admin_transfer(results, index, coin, cb) {
	var cur_txn = results[index];
	var amount = parseFloat(parseFloat(cur_txn.outcome.deliveredAmount['value']).toFixed(8));
	var datas = {
		email: 'admin',
		txnid: cur_txn.id,
		currency: coin.toLowerCase(),
		ordertype: 'deposit',
		category: 'self',
		type: 'crypto',
		description: 'Transaction Success',
		sendaddress: cur_txn.specification.source['address'],
		receiveaddress: cur_txn.specification.destination['address'],
		amount: amount,
		actualamount: amount,
		confirmations: 6,
		status: 1,
		fee: 0,
		mainFee: 0,
		date: new Date()
	};
	if (cur_txn.specification.destination['tag'] == undefined || cur_txn.specification.destination['tag'] == null || cur_txn.specification.destination['tag'] == '' || cur_txn.specification.destination['tag'] == config['xrp'].tag) {
		adminTransfer.findOne({ ordertype: 'deposit', currency: 'xrp', txnid: cur_txn.id }, async (err, avail) => {
			if (!avail) {
				var generate = await adminTransfer.create(datas)
			}
			if (results.length !== index + 1)
				xrp_admin_transfer(results, ++index, coin, cb)
			else
				cb({ status: true })
		})
	} else {
		if (results.length !== index + 1)
			xrp_admin_transfer(results, ++index, coin, cb)
		else
			cb({ status: true })
	}
}


// async function get_xrp_transaction(addressData, index, coin_info, cb){
// 	var curAddress = addressData[index];
// 	console.log('curAddress-------->',curAddress)
// 	request(`wss://s.altnet.rippletest.net:51233/transaction?count=true&limit=20&start=${coin_info.latest_block}&address=${curAddress.address}`, (error, response, body)=>{
// 		console.log('body-------->',body)
// 		//'wss://s.altnet.rippletest.net:51233
// 	if(body){
// 		var data = JSON.parse(body);
// 		console.log('body data-------->',data )
// 		if(data.data !== undefined && data.data !== null && data.data !== ''){
// 			var filterData = data.data.filter(e=>{return e.toAddress == curAddress.address }).filter(e=>{ return e.tokenInfo.tokenName == 'xrp' });
// 			if(filterData.length > 0){
// 				var i = 0;
// 				update_xrp_transaction(curAddress, filterData, i, coin_info, (result)=>{
// 		    		if(addressData.length != index+1)	
// 		    			get_xrp_transaction(addressData, ++index, coin_info, cb)
// 		    		else
// 		    			cb({status:true})
// 				})
// 			}else{
// 	    		if(addressData.length != index+1)	
// 	    			get_xrp_transaction(addressData, ++index, coin_info, cb)
// 	    		else
// 	    			cb({status:true})
// 			}
// 		}else{
//     		if(addressData.length != index+1)	
//     			get_xrp_transaction(addressData, ++index, coin_info, cb)
//     		else
//     			cb({status:true})
// 		}
// 	}else{
// 		if(addressData.length != index+1)	
// 			get_xrp_transaction(addressData, ++index, coin_info, cb)
// 		else
// 			cb({status:true})
// 	}
// 	})
// }

// async function update_xrp_transaction(userInfo, results, index, coin_info, cb){
// 	var transaction = results[index];
// 	console.log('transaction-------->',transaction)
// 	var user_email = Encrypter.decrypt_data(userInfo.email);
// 	console.log('user_email-------->',user_email)
// 	var wallet_data = await wallet.findOne({userId:userInfo.userId, 'wallet.currency':'xrp'}, {'wallet.$':1}).exec();
// 	console.log('wallet_data-------->',wallet_data)
// 	var received_amount = parseFloat(transaction.amount) / 1000000;
// 	console.log('received_amount---->',received_amount)
// 	var transaction_data = {
// 		userId:userInfo.userId,
// 		blockhash:transaction.hash,
// 		hash:transaction.hash,
// 		currency:'xrp',
// 		ordertype:'receive',
// 		receiveaddress:transaction.toAddress,
// 		sendaddress:transaction.ownerAddress,
// 		amount:received_amount, 
// 		actualamount:received_amount,
// 		description:'Transaction success',
// 		explorer:`${explorer["xrp"]}${transaction.hash}`,
// 		txnid:transaction.block,
// 		status:1, 
// 		date:new Date()
// 	}
// 	console.log('transaction_data----->',transaction_data)
// 	crypto.findOne({hash:transaction_data.hash, ordertype:'receive', currency:'xrp'}, async(err, exists)=>{
// 		console.log('exists----->',exists)
// 	if(!exists){
// 		var generate_record = await crypto.create(transaction_data);
// 		var wallet_amount = wallet_data.wallet[0].amount + transaction_data.actualamount
// 		var update_wallet = await wallet.updateOne({userId:userInfo.userId, 'wallet.currency':'xrp'}, {$set:{'wallet.$.amount':wallet_amount}}).exec();
// 		var mail_data = {
// 			"##coin##":transaction_data.currency.toUpperCase(),
// 			"##user##":userInfo.firstname,
// 			"##txnid##":transaction_data.hash,
// 			"##amount##":transaction_data.actualamount,
// 			"##state##":"Success",
// 			"##message##":transaction_data.description,
// 			"##date##":Helper.dateToDMY(transaction_data.date),
// 		}, subject_data = {"##coin##":transaction_data.currency.toUpperCase()};
// 		Mailer.send({to:user_email, changes:mail_data, subject:subject_data, template:'deposit'})
// 	}
// 	if(results.length !== index+1)
// 		update_xrp_transaction(userInfo, results, ++index, coin_info, cb)
// 	else{
// 		update_block_number('xrp', transaction.block)
// 		cb({status:true})
// 	}
// 	})
// }

async function eth() {
	var currency_data = await currency.findOne({ symbol: 'eth' }).exec();
	//console.log('currency_data1=====>',currency_data)
	var response = await address.aggregate([
		{ $match: { currency: 'eth' } },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $project: { address: 1, tag: 1, userId: 1, email: '$user_data.email', firstname: '$user_data.firstname' } }
	]).exec();
	// console.log('response1=============>', response)
	if (response.length > 0) {
		var index = 0;
		get_eth_transaction(response, index, currency_data, (result) => {
			return;
		})
	}
}

async function get_eth_transaction(user_data, i, currency_data, cb) {
	var userData = user_data[i];
	//console.log('userData====>',userData)
	request.get('https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + userData.address + '&startblock=0&endblock=99999999&sort=asc&apikey=Y7K373TUWKT7XFD4XBYWCE5SFS82GTEJIV', (error, response_data, body) => {
		//console.log('response_data--->',response_data)
		//console.log('body--->',body)
		if (body) {
			var data = JSON.parse(body);
			if (data.status == '1') {
				var index = 0;
				update_eth_transaction(data.result, userData, currency_data, index, (result) => {
					if (user_data.length != i + 1)
						get_eth_transaction(user_data, ++i, currency_data, cb)
					else
						cb({ status: true })
				})
			} else {
				if (user_data.length != i + 1)
					get_eth_transaction(user_data, ++i, currency_data, cb)
				else
					cb({ status: true })
			}
		}
		else {
			if (user_data.length != i + 1)
				get_eth_transaction(user_data, ++i, currency_data, cb)
			else
				cb({ status: true })
		}
	})
}

async function update_eth_transaction(transaction_data, userData, coin_data, index, cb) {
	var transaction = transaction_data[index];
	var user_email = Encrypter.decrypt_data(userData.email);
	var wallet_data = await wallet.findOne({ userId: userData.userId, 'wallet.currency': 'eth' }, { 'wallet.$': 1 }).exec()
	if (transaction && userData.address === transaction.to) {
		var received_amount = parseFloat(transaction.value) / 1000000000000000000;
		var details = {
			userId: userData.userId,
			blockhash: transaction.blockHash,
			hash: transaction.hash,
			currency: 'eth',
			ordertype: 'receive',
			receiveaddress: transaction.to,
			sendaddress: transaction.from,
			amount: received_amount,
			actualamount: received_amount,
			description: 'Transaction success',
			explorer: `${ explorer["eth"] }${ transaction.hash }`,
			status: 1,
			date: new Date()
		};
		crypto.findOne({ hash: details.hash, ordertype: 'receive', currency: 'eth' }, async (err, found_transaction) => {
			if (!found_transaction) {
				var generate_record = await crypto.create(details)
				var wallet_amount = wallet_data.wallet[0].amount + details.amount;
				var wallet_updated = await wallet.updateOne({ userId: details.userId, 'wallet.currency': 'eth' }, { $set: { 'wallet.$.amount': wallet_amount } }).exec()
				var mail_data = {
					"##coin##": coin_data.symbol.toUpperCase(),
					"##user##": userData.firstname,
					"##txnid##": details.hash,
					"##amount##": details.actualamount,
					"##fee##": details.mainFee,
					"##state##": "Success",
					"##message##": details.description,
					"##date##": Helper.dateToDMY(new Date())
				}, subject_data = { "##coin##": coin_data.symbol.toUpperCase() };
				Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })
				if (transaction_data.length != index + 1)
					update_eth_transaction(transaction_data, userData, coin_data, ++index, cb);
				else {
					update_block_number('eth', transaction.blockNumber);
					cb({ status: true })
				}
			}
			else {
				if (transaction_data.length != index + 1)
					update_eth_transaction(transaction_data, userData, coin_data, ++index, cb);
				else {
					update_block_number('eth', transaction.blockNumber);
					cb({ status: true })
				}
			}
		})
	} else {
		if (transaction_data.length != index + 1)
			update_eth_transaction(transaction_data, userData, coin_data, ++index, cb);
		else {
			update_block_number('eth', transaction.blockNumber);
			cb({ status: true })
		}
	}
}

async function admin_eth() {
	var currency_data = await currency.findOne({ symbol: 'eth' }).exec();
	var address_data = _ether['eth'].address.slice();
	var endblock = currency_data.latest_block + 50;
	request.get(`http://api.etherscan.io/api?module=account&action=txlist&address=${ address_data }&startblock=${ currency_data.latest_block }&endblock=${ endblock }&sort=asc&apikey=Y7K373TUWKT7XFD4XBYWCE5SFS82GTEJIV`, (error, response_data, body) => {
		if (body) {
			var data = JSON.parse(body);
			if (data.status == '1') {
				var index = 0;
				data.result = data.result.filter(e => { return e.to == address_data });
				_eth_wallet_admin(data.result, index, currency_data.symbol, (result) => {
					return;
				})
			}
		}
	})
}

async function _eth_wallet_admin(results, index, coin, cb) {
	var cur_txn = results[index];
	var txnid = cur_txn.hash;
	adminTransfer.findOne({ currency: coin, txnid: txnid, ordertype: 'deposit' }, async (err, avail) => {
		if (!avail) {
			var amount = parseFloat(cur_txn.value) / 1000000000000000000;
			var datas = {
				email: 'admin',
				txnid: txnid,
				currency: coin,
				ordertype: 'deposit',
				category: 'self',
				type: 'crypto',
				description: 'Transaction Success',
				sendaddress: cur_txn.from,
				receiveaddress: _ether[coin].address.slice(1, -1),
				amount: amount,
				actualamount: amount,
				confirmations: cur_txn.confirmations,
				status: 1,
				fee: 0,
				mainFee: 0,
				date: new Date()
			};

			var generate = await adminTransfer.create(datas)
			if (results.length !== index + 1)
				_bnb_wallet_admin(results, ++index, cb)
			else
				cb({ status: true })
		} else {
			if (results.length !== index + 1)
				_bnb_wallet_admin(results, ++index, cb)
			else
				cb({ status: true })
		}
	})
}

async function trcusdt() {
	var coin_info = await currency.findOne({ symbol: 'trx' }).exec();
	var addressData = await address.aggregate([
		{ $match: { currency: 'trx' } },
		{ $lookup: { from: 'BYTEEX_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $project: { address: 1, tag: 1, userId: 1, email: '$user_data.email', firstname: '$user_data.firstname' } }
	]).exec();
	if (addressData.length > 0) {
		var index = 0;
		get_trcusdt_transaction(addressData, index, coin_info, (result) => {
			return;
		})
	}
}

function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

async function get_trcusdt_transaction(addressData, index, coin_info, cb) {
	var curAddress = addressData[index];
	request(`https://api.trongrid.io/v1/accounts/${ curAddress.address }/transactions/trc20?start=${ coin_info.latest_block }&limit=20&contract_address=TUtTUSMH1fMJJyANcrLSNLEbK7sieJeeeK`, (error, response, body) => {
		if (isJson(body)) {
			var data = JSON.parse(body);
			if (data.data !== undefined && data.data !== null && data.data !== '') {
				var filterData = data.data
				if (filterData.length > 0) {
					var i = 0;
					update_trcusdt_transaction(curAddress, filterData, i, coin_info, (result) => {
						if (addressData.length != index + 1)
							get_trcusdt_transaction(addressData, ++index, coin_info, cb)
						else
							cb({ status: true })
					})
				} else {
					if (addressData.length != index + 1)
						get_trcusdt_transaction(addressData, ++index, coin_info, cb)
					else
						cb({ status: true })
				}
			} else {
				if (addressData.length != index + 1)
					get_trcusdt_transaction(addressData, ++index, coin_info, cb)
				else
					cb({ status: true })
			}
		} else {
			if (addressData.length != index + 1)
				get_trcusdt_transaction(addressData, ++index, coin_info, cb)
			else
				cb({ status: true })
		}
	})
}

async function update_trcusdt_transaction(userInfo, results, index, coin_info, cb) {
	var transaction = results[index];
	var user_email = Encrypter.decrypt_data(userInfo.email);
	var wallet_data = await wallet.findOne({ userId: userInfo.userId, 'wallet.currency': 'trxusdt' }, { 'wallet.$': 1 }).exec();
	var received_amount = parseFloat(transaction.value) / 1000000000000000000;
	var transaction_data = {
		userId: userInfo.userId,
		email: user_email,
		blockhash: transaction.transaction_id,
		hash: transaction.transaction_id,
		currency: 'trxusdt',
		ordertype: 'receive',
		receiveaddress: transaction.to,
		sendaddress: transaction.from,
		amount: received_amount,
		actualamount: received_amount,
		description: 'Transaction success',
		explorer: `${ explorer["trx"] }${ transaction.transaction_id }`,
		txnid: transaction.block_timestamp,
		status: 1,
		date: new Date()
	}
	crypto.findOne({ hash: transaction_data.hash, ordertype: 'receive', currency: 'trxusdt' }, async (err, exists) => {
		if (!exists) {
			var generate_record = await crypto.create(transaction_data);
			var wallet_amount = wallet_data.wallet[0].amount + transaction_data.actualamount
			var update_wallet = await wallet.updateOne({ userId: userInfo.userId, 'wallet.currency': 'trxusdt' }, { $set: { 'wallet.$.amount': wallet_amount } }).exec();
			var mail_data = {
				"##coin##": transaction_data.currency.toUpperCase(),
				"##user##": userInfo.firstname,
				"##txnid##": transaction_data.transaction_id,
				"##amount##": transaction_data.value,
				"##state##": "Success",
				"##message##": transaction_data.description,
				"##date##": Helper.dateToDMY(transaction_data.date),
			}, subject_data = { "##coin##": transaction_data.currency.toUpperCase() };
			Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })
		}
		if (results.length !== index + 1)
			update_trcusdt_transaction(userInfo, results, ++index, coin_info, cb)
		else {
			cb({ status: true })
		}
	})
}


async function usdt() {
	var coin_info = await currency.findOne({ symbol: 'usdt' }).exec()
	var details = await address.aggregate([
		{ $match: { currency: 'usdt' } },
		{ $lookup: { from: 'MRADULEXG_STEUSE', localField: 'userId', foreignField: '_id', as: 'user_data' } },
		{ $unwind: '$user_data' },
		{ $project: { email: '$user_data.email', userId: 1, currency: 1, address: 1, firstname: '$user_data.firstname' } }
	]).exec();
	if (details.length > 0) {
		if (coin_info.contract_address !== undefined && coin_info.contract_address !== null) {
			var options = {
				url: `https://api.etherscan.io/api`,
				headers: { 'Content-Type': 'application/json' },
				qs: {
					'module': 'account',
					'action': 'tokentx',
					'contractaddress': coin_info.contract_address,
					'startblock': coin_info.latest_block,
					'endblock': 999999999,
					'sort': 'asc',
					'apikey': 'Y7K373TUWKT7XFD4XBYWCE5SFS82GTEJIV'
				}
			}

			request(options, (error, response, body) => {
				if (body) {
					var data = JSON.parse(body);
					if (data.status == '1' && data.result.length > 0) {
						var index = 0;
						var all_address = details.map(e => { return e.address });
						data.result = data.result.filter(e => { return all_address.indexOf(e.to) > -1 });
						if (data.result.length > 0) {
							update_usdt_details(data.result, details, index, coin_info, (result) => {
								return
							})
						}


					} else
						return;
				} else
					return;
			})
		} else
			return;
	} else
		return;
}

async function update_usdt_details(records, user_info, index, coin_info, cb) {
	var cur_txn = records[index];
	var cur_user = user_info.find(e => { return e.address == cur_txn.to });
	var wallet_data = await wallet.findOne({ userId: cur_user.userId, 'wallet.currency': coin_info.symbol.toLowerCase() }, { 'wallet.$': 1 }).exec();
	var user_email = Encrypter.decrypt_data(cur_user.email)
	var received_amount = parseFloat(cur_txn.value) / Math.pow(10, coin_info.decimal);
	var transaction = {
		userId: cur_user.userId,
		blockhash: cur_txn.hash,
		hash: cur_txn.hash,
		currency: coin_info.symbol.toLowerCase(),
		ordertype: 'receive',
		receiveaddress: cur_txn.to,
		sendaddress: cur_txn.from,
		amount: received_amount,
		actualamount: received_amount,
		description: 'Transaction success',
		explorer: `${ explorer["eth"] }${ cur_txn.hash }`,
		txnid: cur_txn.blockNumber,
		status: 1,
		date: new Date()
	};
	crypto.findOne({ hash: transaction.hash, currency: transaction.currency, ordertype: 'receive' }, async (err, avail) => {
		if (!avail) {
			var generate_record = await crypto.create(transaction)
			var mail_data = {
				"##coin##": transaction.currency.toUpperCase(),
				"##user##": cur_user.profileUpdated == true ? cur_user.firstname : '',
				"##txnid##": transaction.hash,
				"##from##": transaction.sendaddress,
				"##to##": transaction.receiveaddress,
				"##amount##": transaction.actualamount,
				"##state##": "Success",
				"##message##": transaction.description,
				"##date##": Helper.dateToDMY(new Date())
			}, subject_data = { "##coin##": transaction.currency.toUpperCase() };
			var wallet_amount = wallet_data.wallet[0].amount + received_amount;
			var update_wallet = await wallet.updateOne({ userId: transaction.userId, 'wallet.currency': transaction.currency }, { $set: { 'wallet.$.amount': wallet_amount } }).exec()
			Mailer.send({ to: user_email, changes: mail_data, subject: subject_data, template: 'deposit' })

			if (records.length !== index + 1)
				update_usdt_details(records, user_info, ++index, coin_info, cb)
			else {
				update_block_number(coin_info.symbol.toLowerCase(), cur_txn.blockNumber)
				cb({ status: true })
			}

		} else {
			if (records.length !== index + 1)
				update_usdt_details(records, user_info, ++index, coin_info, cb)
			else {
				update_block_number(coin_info.symbol.toLowerCase(), cur_txn.blockNumber)
				cb({ status: true })
			}
		}
	})
}

async function _eth_wallet_admin(result, index, coin, cb) {
	var cur_txn = results[index];
	var txnid = cur_txn.hash;
	adminTransfer.findOne({ currency: coin, txnid: txnid, ordertype: 'deposit' }, async (err, avail) => {
		if (!avail) {
			var amount = parseFloat(cur_txn.value) / 1000000000000000000;
			var datas = {
				email: 'admin',
				txnid: txnid,
				currency: coin,
				ordertype: 'deposit',
				category: 'self',
				type: 'crypto',
				description: 'Transaction Success',
				sendaddress: cur_txn.from,
				receiveaddress: _ether[coin].address.slice(1, -1),
				amount: amount,
				actualamount: amount,
				confirmations: cur_txn.confirmations,
				status: 1,
				fee: 0,
				mainFee: 0,
				date: new Date()
			};

			var generate = await adminTransfer.create(datas)
			if (results.length !== index + 1)
				_bnb_wallet_admin(results, ++index, cb)
			else
				cb({ status: true })
		} else {
			if (results.length !== index + 1)
				_bnb_wallet_admin(results, ++index, cb)
			else
				cb({ status: true })
		}
	})
}

async function update_block_number(coin, block) {
	currency.updateOne({ symbol: coin }, { $set: { latest_block: block } }, (err, response) => {
		return;
	})
}