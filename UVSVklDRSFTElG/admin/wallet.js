var mongoose = require('mongoose');

var adminHistory = require('../../model/admin-transfer'),
	userCryptoHistory = require('../../model/crypto'),
	adminWallet = require('../../model/admin-wallet'),
	userFiatHistory = require('../../model/fiat'),
	admin = require('../../model/admin'),
	profit = require('../../model/profit'),
	currency = require('../../model/currency');

var _bitcoin = require('../../QRklHLVNFRFWE/QlRDLUNSWVBUTw'),
 	_ether = require('../../QRklHLVNFRFWE/RVRILUNSWVBUTw'),
 	_tron = require('../../QRklHLVNFRFWE/VFJYLUNSWVBUTw'),
 	_binance = require('../../QRklHLVNFRFWE/QkCLUNSWVBUTw'),
	_ripple = require('../../QRklHLVNFRFWE/XRPGHxvganDf'),
 	_token = require('../../QRklHLVNFRFWE/VVNEVCDUllQVE');


var	Reposit = require('../../helper/crypto'),
	Tfa = require('../../helper/2fa'),
	Mailer = require('../../helper/mailer'),
	Helper = require('../../helper/helper'),
	Common = require('../../helper/common'),
	socket_config = require('../../helper/config');

var explorer = {
	"btc":`https://www.blockchain.com/btc/tx/`,
	"eth":`https://etherscan.io/tx/`,
	"bnb":`https://binance.mintscan.io/txs/`,
	"trx":`https://tronscan.org/#/transaction/`
	// "xrp":`https://xrpscan.com/ledger/`
};

module.exports.admin_transaction_history = (req, res)=>{
	if(Common._validate_origin(req, res)){
	var filter = {};
	if(req.params.id.toLowerCase() !== 'all'){
		filter = {currency:req.params.id.toLowerCase()}
	};

	adminHistory.aggregate([
		{$project:{amount:'$actualamount', currency:1, date:1, fee:1, mainFee:1, ordertype:1, status:1, description:1, reason:1, txnid:1}}
	], (err, response)=>{
	if(response.length > 0){
		response = response.map(e=>{
			e.url = `${explorer[e.currency]}${e.txnid}`;
			return e;
		})
		res.status(200).send({status:true, code:200, data:response})	
	}
	else if(response.length == 0)
		res.status(201).send({status:false, code:400, message:"No results found"})
	else
		res.status(201).send({status:false, code:400, message:"Server not found"})
	});
}
}

module.exports.admin_transaction_details = (req, res)=>{
	if(Common._validate_origin(req, res)){
	adminHistory.findOne({_id:req.params.id}, (err,response)=>{
	if(response)	
		res.status(200).send({status:true, code:200, data:response})
	else if(!response)
		res.status(201).send({status:false, code:400, message:'No results found'})
	else
		res.status(201).send({status:false, code:400, message:"Server not found"})
	})
}
}

async function get_admin_details(coin){
	var address = {};
	if(coin == "btc")
		address = _bitcoin['btc'];
	else if(coin == "eth")
		address = _ether['eth'];
	else if(coin == "trx")
		address = _tron['trx'];
	// else if(coin == "xrp")
	// 	address = _ripple['xrp'];
	else if(coin == "bnb")
		address = _binance['bnb'];
	else if(coin == "usdt")
		address = _ether['eth'];
	else if(coin == "trxusdt")
		address = _tronusdt['trxusdt'];
	else
		address = address;

	return address;
}

module.exports.wallet_balance_info = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var filter = {};
	var txnData = await	adminHistory.aggregate([{$match:filter}, {$project:{amount:1, actualamount:1, currency:1, fee:1, mainFee:1, ordertype:1, status:1}}]).exec();
	var userCryptoTxn = await userCryptoHistory.aggregate([{$project:{amount:1, actualamount:1, currency:1, fee:1, mainFee:1, ordertype:1, status:1, movedAdmin:1}}]).exec();
	var userFiatTxn = await userFiatHistory.aggregate([{$project:{amount:1, actualamount:1, currency:1, fee:1, mainFee:1, ordertype:'$category', status:1, gateway:1}}]).exec();
	var coin_data = await currency.find({}, {symbol:1, btc_value:1, logo:1, wallet_address:1, _id:0, transfer_percent:1, status:1, type:1 }).exec();
	var profit_data = await profit.find({}).exec()
	var admin_wallet = await adminWallet.find({}).exec()
	var myArr = [];

	var cryptos = coin_data.filter(e=>{ return e.type == "crypto" });
	myArr = cryptos.map(function(e){
		var details = {};
		if(e.symbol == "btc")
			details = _bitcoin['btc'];
		else if(e.symbol == "eth")
			details = _ether['eth'];
		else if(e.symbol == "trx")
			details = _tron['trx'];
		// else if(e.symbol == "xrp")
		// 	details = _ripple['xrp'];
		else if(e.symbol == "bnb")
			details = _binance['bnb'];
		else if(e.symbol == "usdt")
			details = _ether['eth'];
		else if(coin == "trxusdt")
			address = _tronusdt['trxusdt'];
		else
			details = details;

		var obj = { 
			currency:e.symbol,
			address:details.address.slice(1, -1) !== undefined?details.address.slice(1, -1):'',
			tag:e.symbol.toLowerCase() == "xrp"?details.tag:'',
			memo:e.symbol.toLowerCase() == "bnb" > -1?details.tag.slice(1, -1):''
		}
		return obj;
	})

	myArr = myArr.map(e=>{
		e.wallet_data = coin_data.find(element=>{ return element.symbol == e.currency });
		var adminDeposit = txnData.filter(element=>{ return element.ordertype == "deposit" && element.currency == e.currency });
		var userDeposit = userCryptoTxn.filter(element=>{ return element.ordertype == "receive" && element.currency == e.currency && element.movedAdmin == false});
		var adminWithdraw = txnData.filter(element=>{ return element.ordertype == "withdraw" && element.currency == e.currency});
		var userWithdraw = userCryptoTxn.filter(element=>{ return element.ordertype == "send" && element.currency == e.currency && element.movedAdmin == false});
		var total_data = profit_data.filter(element=>{ return element.currency == e.currency });

		e.total_deposit = adminDeposit.length;
		e.total_withdraw = adminWithdraw.length;
		e.deposit_amount = parseFloat(adminDeposit.filter(e=>{return e.status == 1}).map(e=>{return e.actualamount }).reduce((a,b)=>a+b, 0)) + parseFloat(userDeposit.filter(e=>{return e.status == 1}).map(e=>{return e.actualamount }).reduce((a,b)=>a+b, 0));
		e.withdraw_amount = parseFloat(adminWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.actualamount }).reduce((a,b)=>a+b, 0)) + parseFloat(userWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.actualamount }).reduce((a,b)=>a+b, 0));
		e.deposit_mining_fee = parseFloat(adminDeposit.filter(e=>{return e.status == 1}).map(e=>{return e.mainFee }).reduce((a,b)=>a+b, 0)) + parseFloat(userWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.mainFee }).reduce((a,b)=>a+b, 0));
		e.withdraw_mining_fee = parseFloat(adminWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.mainFee }).reduce((a,b)=>a+b, 0)) + parseFloat(userWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.mainFee }).reduce((a,b)=>a+b, 0));
		e.deposit_net_fee = parseFloat(adminDeposit.filter(e=>{return e.status == 1}).map(e=>{return e.fee }).reduce((a,b)=>a+b, 0)) + parseFloat(userWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.fee }).reduce((a,b)=>a+b, 0));
		e.withdraw_net_fee = parseFloat(adminWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.fee }).reduce((a,b)=>a+b, 0)) + parseFloat(userWithdraw.filter(e=>{return e.status == 1}).map(e=>{return e.fee }).reduce((a,b)=>a+b, 0));
		e.approved_deposit = adminDeposit.filter(e=>{ return e.status == 1 }).length;
		e.approved_withdraw = adminWithdraw.filter(e=>{ return e.status == 1 }).length;
		e.pending_deposit = adminDeposit.filter(e=>{ return e.status == 2 }).length;
		e.pending_withdraw = adminWithdraw.filter(e=>{ return e.status == 2 }).length;
		e.cancelled_deposit = adminDeposit.filter(e=>{ return e.status == 0 }).length;
		e.cancelled_withdraw = adminWithdraw.filter(e=>{ return e.status == 0 }).length;
		e.balance = 0;
		var balance_data = admin_wallet.find(bal=>{ 
			return e.currency == bal.currency 
		});
		if(balance_data !== undefined){
			e.balance = balance_data.balance;
		}
		e.profit = total_data.map(e=>{ return e.profit }).reduce((a, b)=>a+b, 0)
		return e;
	}).filter(e=>{ return e !== null && e !== undefined });

	var total_deposit = userFiatTxn.filter(e=>{return e.ordertype == 'deposit'});
	var total_withdraw = userFiatTxn.filter(e=>{return e.ordertype == 'withdraw' });
	var deposit_amount = total_deposit.filter(e=>{ if(e.status == 1){return e;}else if(e.status == 2 && e.gateway.toLowerCase() == "instantpay"){return e;}else if(e.status == 0 && e.gateway.toLowerCase() == "instantpay"){ var amt = e.actualamount+e.mainFee; if(amt > 0){ return e;} }else{ }}).filter(elem=>{ return elem !== null && elem !== undefined }).map(element=>{ return element.actualamount+element.mainFee }).reduce((a,b)=> a+b, 0),
		withdraw_amount = parseFloat(total_withdraw.filter(e=>{return e.status == 1}).map(e=>{ return e.actualamount }).reduce((a,b)=> a+b, 0).toFixed(2)),
		withdraw_mining_fee = parseFloat(total_withdraw.filter(e=>{return e.status == 1}).map(e=>{ return e.fee }).reduce((a,b)=> a+b, 0).toFixed(2)),
		withdraw_net_fee = parseFloat(total_withdraw.filter(e=>{return e.status == 1}).map(e=>{ return e.fee }).reduce((a,b)=> a+b, 0).toFixed(2)),
		total_data = profit_data.filter(element=>{ return element.currency == "usd" });

	var fiat_data = {
		currency:'usd',
		total_deposit:total_deposit.length,
		total_withdraw:total_withdraw.length,
		deposit_amount:parseFloat(deposit_amount.toFixed(2)),
		withdraw_amount:parseFloat(withdraw_amount.toFixed(2)),	
		deposit_mining_fee:total_deposit.map(e=>{ return e.fee }).reduce((a,b)=> a+b, 0),
		withdraw_mining_fee:withdraw_mining_fee,
		deposit_net_fee:total_deposit.filter(e=>{ if(e.status == 2 && e.gateway.toLowerCase() == 'instantpay'){return e; }else if(e.status == 1){ return e; }else{ } }).filter(ele=>{return ele !== undefined && ele !== null }).map(e=>{ return e.mainFee }).reduce((a,b)=> a+b, 0 ),
		withdraw_net_fee:withdraw_net_fee,
		pending_deposit:total_deposit.filter(e=>{return e.status == 2}).length,
		approved_deposit:total_deposit.filter(e=>{return e.status == 1}).length,
		cancelled_deposit:total_deposit.filter(e=>{return e.status == 0}).length,
		pending_withdraw:total_withdraw.filter(e=>{return e.status == 2}).length,
		approved_withdraw:total_withdraw.filter(e=>{return e.status == 1}).length,
		cancelled_withdraw:total_withdraw.filter(e=>{return e.status == 0}).length,
		balance:parseFloat((deposit_amount - (withdraw_amount + withdraw_mining_fee + withdraw_net_fee)).toFixed(2)),
		profit:total_data.map(e=>{ return e.profit }).reduce((a, b)=>a+b, 0),
		wallet_data:coin_data.find(element=>{ return element.symbol == "usd" }) 
	};

	myArr.unshift(fiat_data);

	myArr = myArr.map(e=>{
		e.btc_value_deposit = e.deposit_amount * e.wallet_data.btc_value;
		e.btc_value_withdraw = e.withdraw_amount * e.wallet_data.btc_value;
		e.btc_value_deposit_mfee = e.deposit_mining_fee * e.wallet_data.btc_value;
		e.btc_value_withdraw_mfee = e.withdraw_mining_fee * e.wallet_data.btc_value;
		e.btc_value_deposit_nfee = e.deposit_net_fee * e.wallet_data.btc_value;
		e.btc_value_withdraw_nfee = e.withdraw_net_fee * e.wallet_data.btc_value;
		e.btc_total_balance = e.balance * e.wallet_data.btc_value;
		e.btc_total_profit = e.profit * e.wallet_data.btc_value;
		return e;
	});

	var all_data = {
		currency:"all",
		total_deposit:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.total_deposit }).reduce((a, b)=> a+b, 0),
		total_withdraw:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.total_withdraw }).reduce((a, b)=> a+b, 0),
		deposit_amount:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_value_deposit }).reduce((a, b)=> a+b, 0),
		withdraw_amount:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_value_withdraw }).reduce((a, b)=> a+b, 0),
		deposit_mining_fee:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_value_deposit_mfee }).reduce((a, b)=> a+b, 0),
		withdraw_mining_fee:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_value_withdraw_mfee }).reduce((a, b)=> a+b, 0),
		deposit_net_fee:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_value_deposit_nfee }).reduce((a, b)=> a+b, 0),
		withdraw_net_fee:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_value_withdraw_nfee }).reduce((a, b)=> a+b, 0),
		approved_deposit:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.approved_deposit }).reduce((a, b)=> a+b, 0),
		approved_withdraw:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.approved_withdraw }).reduce((a, b)=> a+b, 0),
		pending_deposit:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.pending_deposit }).reduce((a, b)=> a+b, 0),
		pending_withdraw:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.pending_withdraw }).reduce((a, b)=> a+b, 0),
		cancelled_withdraw:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.cancelled_withdraw }).reduce((a, b)=> a+b, 0),
		cancelled_deposit:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.cancelled_deposit }).reduce((a, b)=> a+b, 0),
		balance:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_total_balance }).reduce((a, b)=> a+b, 0),
		profit:myArr.filter(elem=>{return elem.currency !== 'usd'}).map(e=>{ return e.btc_total_profit }).reduce((a, b)=> a+b, 0)
	}
	myArr.unshift(all_data);

	res.status(201).send({status:true, code:200, data:myArr})
}
}

module.exports.profit_details_info = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var profit_list = await profit.find({}).exec();
	var withdraw_list = await adminHistory.find({withdrawtype:'profit'}).exec();
	profit_list = profit_list.map(e=>{ e.profit = parseFloat(parseFloat(e.profit).toFixed(8)); return e; });

	var coin_data = await currency.find({}, {symbol:1, currency:1}).exec();
	var profit_data = profit_list.map(e=>{
		if(e.currency == 'usd' && e.category == 'deposit')
			e.category = 'receive';
		else if(e.currency == 'usd' && e.category == 'withdraw')
			e.category = 'send';
		else
			e.category = e.category;

		return e;
	})
	var crypto_result = coin_data.map(e=>{
		var obj = {
			currency:e.currency,
			symbol:e.symbol,
			deposit:profit_data.filter(elem => {return elem.currency == e.symbol && elem.category == "receive" }).map(data=>{return data.profit }).reduce((a,b)=> a+b, 0),
			withdraw:profit_data.filter(elem => {return elem.currency == e.symbol && elem.category == "send" }).map(data=>{return data.profit }).reduce((a,b)=> a+b, 0),
			trade_buy:profit_data.filter(elem => {return elem.currency == e.symbol && elem.category == "trade buy" }).map(data=>{return data.profit }).reduce((a,b)=> a+b, 0),		
			trade_sell:profit_data.filter(elem => {return elem.currency == e.symbol && elem.category == "trade sell" }).map(data=>{return data.profit }).reduce((a,b)=> a+b, 0),
			withdrawn_profit:withdraw_list.filter(elem=>{ return elem.currency == e.symbol }).map(data=>{return data.actualamount }).reduce((a,b)=> a+b, 0),
			total_profit:profit_data.filter(elem=>{ return elem.currency == e.symbol }).map(data=>{return data.profit }).reduce((a,b)=> a+b, 0),
		}

		if(obj.currency == 'usd'){
			obj.deposit = parseFloat(parseFloat(obj.deposit).toFixed(2))
			obj.withdraw = parseFloat(parseFloat(obj.withdraw).toFixed(2))
			obj.trade_buy = parseFloat(parseFloat(obj.trade_buy).toFixed(2))
			obj.trade_sell = parseFloat(parseFloat(obj.trade_sell).toFixed(2))
			obj.withdrawn_profit = parseFloat(parseFloat(obj.withdrawn_profit).toFixed(2))
			obj.total_profit = parseFloat(parseFloat(obj.total_profit).toFixed(2))
			obj.available_profit = obj.total_profit - obj.withdrawn_profit;
		}else{
			obj.deposit = parseFloat(parseFloat(obj.deposit).toFixed(8))
			obj.withdraw = parseFloat(parseFloat(obj.withdraw).toFixed(8))
			obj.trade_buy = parseFloat(parseFloat(obj.trade_buy).toFixed(8))
			obj.trade_sell = parseFloat(parseFloat(obj.trade_sell).toFixed(8))
			obj.withdrawn_profit = parseFloat(parseFloat(obj.withdrawn_profit).toFixed(8))
			obj.total_profit = parseFloat(parseFloat(obj.total_profit).toFixed(8))
			obj.available_profit = obj.total_profit - obj.withdrawn_profit;
		}

		return obj;
	})

	res.status(201).send({status:true, code:200, data:crypto_result, profit_history:profit_list})
}
}	

module.exports.admin_withdraw = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var history_data = await history.findOne({userId:req.user_id, access_token:req.headers.authorization}).exec()
	var currency_data = await currency.findOne({symbol:req.body.currency.toLowerCase()}).exec();
	if(currency_data.type == "crypto"){
		var address_data = get_admin_details(req.body.currency.toLowerCase());
	};

	if(req.body.type == undefined && req.body.type == null && req.body.type == ''){
		req.body.type = 'wallet';
	}else{
		req.body.type = 'profit';
	}

	var transaction_data = {
		userId:req.user_id,
		email:req.user,
		ipaddress:history_data.ipaddress || '192.168.2.107',
		category:'self',
		withdrawtype:req.body.type,
		type:currency_data.type,
		currency:req.body.currency.toLowerCase(),
		sendaddress:address_data.address,
		sendertag:address_data.tag,
		receiveaddress:req.body.address,
		receivertag:req.body.tag,
		amount:req.body.amount,
		actualamount:req.body.amount,
		ordertype:'withdraw',
		description:req.body.description,
		status:2,
		mainFee:0,
		fee:0,
		date:new Date(),
	};

	var transfer_data = {
		currency:transaction_data.currency,
		address:transaction_data.receiveaddress,
		amount:transaction_data.amount,
		tag:'',
		contract_address:'',
		decimal:6
	};
	if(currency_data.symbol.toLowerCase() == 'bnb' || currency_data.symbol.toLowerCase() == 'xlm' ||currency_data.symbol.toLowerCase() == 'xrp'){
		transfer_data.tag = transfer_data.receivertag;
	}

	if(currency_data.cointype == "token"){
		transfer_data.contract_address = currency_data.contract_address;
		transfer_data.decimal = currency_data.decimal;
	}
	
	Reposit.transfer_data(transfer_data, async(response)=>{
	if(response.status){
		transaction_data.txnid = response.hash;
		transaction_data.status = 1;
		if(response.fee !== undefined && response.fee !== null && response.fee !== ''){
			transaction_data.mainFee = response.fee;
		}
		var create_transaction = await adminHistory.create(transaction_data).exec();
		res.status(201).send({status:true, code:200, message:'Your transaction completed successfully'})
	}else{
		var create_transaction = await adminHistory.create(transaction_data).exec();
		res.status(201).send({status:true, code:200, message:'Your transaction has been holded.'})
	}
	})
}
}

module.exports.cancel_transaction = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var txn_data = await adminHistory.findOne({_id:req.params.id}).exec();
	if(txn_data.status == 2){
		txn_data.status = 0;
		var update_data = await adminHistory.updateOne({_id:txn_data._id}, {$set:txn_data}).exec(); 
		res.status(200).send({status:true, code:200, message:'Transaction cancelled successfully'})
	}
	else if(txn_data.status == 1)
		res.status(201).send({status:false, code:400, message:'Transaction already completed'})
	else
		res.status(201).send({status:false, code:400, message:'Transaction already cancelled'})
}
}