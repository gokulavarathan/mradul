var Helper = require('../../helper/helper'),
	Mailer = require('../../helper/mailer'),
	TFA = require('../../helper/2fa'),
	Common = require('../../helper/common'),
	Crypto = require('../../helper/crypto'),
	Encrypter = require('../../helper/encrypter');

var address = require('../../model/address'),
	currency = require('../../model/currency'),
	crypto = require('../../model/crypto'),
	profit = require('../../model/profit'),
	user = require('../../model/user'),
	wallet = require('../../model/wallet');

var _bitcoin = require('../../QRklHLVNFRFWE/QlRDLUNSWVBUTw'),
 	_ether = require('../../QRklHLVNFRFWE/RVRILUNSWVBUTw'),
 	_tron = require('../../QRklHLVNFRFWE/VFJYLUNSWVBUTw'),
 	_binance = require('../../QRklHLVNFRFWE/QkCLUNSWVBUTw'),
	_ripple = require('../../QRklHLVNFRFWE/XRPGHxvganDf'),
 	_token = require('../../QRklHLVNFRFWE/VVNEVCDUllQVE');


module.exports._place_crypto = async(req,res)=>{
	if(Common._validate_origin(req, res)){
    var date = Helper.dateToYMD(new Date())+'T00:00:00.000Z';
	var response = await user.findOne({_id:req.user_id}).exec();
    var currency_data = await currency.findOne({symbol:req.body.currency.toLowerCase()}).exec();
	if(!response)
		res.status(200).send({status:false, code:400, message:'No result found'})
	else if(!response.isActive)
		res.status(200).send({status:false, code:400, message:'Your account has been blocked. Please contact our support'})
	else if(!response.emailVerified)
		res.status(201).send({status:false, code:400, message:'Your account is not yet activated'})
	else if(!response.profileUpdated)
		res.status(201).send({status:false, code:400, message:'Please update your profile details'})
	else if(!response.kycVerified)
		res.status(201).send({status:false, code:400, message:'Please verify your KYC'})
	else if(!response.tfaVerified)
		res.status(201).send({status:false, code:400, message:'Please enable your TFA service'})
	else if(!currency_data.status)
		res.status(201).send({status:false, code:400, message:'Transaction not available for this currency'});
	else if(!currency_data.withdraw)
		res.status(201).send({status:false, code:400, message:'Withdraw not availabel for this currency'})
	else{
		// TFA.verify_tfa(req.body.code, response.tfa.tempSecret, async(tfa_verified)=>{
		// if(tfa_verified){
			var address_data = await address.findOne({userId:response._id, currency:req.body.currency.toLowerCase()}).exec();
			var balance = await wallet.findOne({userId:response._id, 'wallet.currency':req.body.currency.toLowerCase()}, {'wallet.$':1}).exec();
			balance = balance.wallet[0];
			if(!address_data)
				res.status(201).send({status:false, code:400, message:'Your address not found'})
			else if(!balance)
				res.status(201).send({status:false, code:401, message:'Unable to fetch your data'})
			else if(balance['amount'] == 0 || balance['amount'] < parseFloat(req.body.amount))
				res.status(201).send({status:false, code:400, message:'Insufficient balance'})
			else{
				var withdraw_amount = parseFloat(req.body.amount).toFixed(8);
				var fee = currency_data.feetype == 'flat'?currency_data.fee:((currency_data.fee/100) * withdraw_amount).toFixed(8);
				var receive_amount = withdraw_amount - fee;
				var message = `${Encrypter.decrypt_data(response.email)} placed a crypto withdraw for ${req.body.amount} ${req.body.currency.toUpperCase()}.`;
				var details = {
					userId:response._id,
					email:Encrypter.decrypt_data(response.email),
					sendaddress:address_data.address,
					receiveaddress:req.body.address,
					currency:req.body.currency.toLowerCase(),
					amount:parseFloat(parseFloat(req.body.amount).toFixed(8)),
					fee:fee,
					actualamount:receive_amount, 
					date:new Date(), 
					description:req.body.description, 
					network:req.body.network ? req.body.network : 'rpc', 
					ordertype:'send', 
					status:2,
					submittedBy:response._id,
					submitterName:response.firstname
				};
				if(details.currency == "xrp" || details.currency == "bnb"){
					details.senderTag = address_data.tag;
					details.receiverTag = req.body.tag;
				}

				var avail_amount = balance.amount - parseFloat(details.amount);
				var hold_amount = balance.hold + parseFloat(details.amount);
				var wallet_updation = await wallet.updateOne({userId:response._id, 'wallet.currency':details.currency}, {$set:{'wallet.$.amount':avail_amount, 'wallet.$.hold':hold_amount}}).exec();
				if(wallet_updation.nModified == 1){
					crypto.create(details, async(err, order_placed)=>{
					if(order_placed){
						var mail_data = {
							"##user##":response.firstname,
							"##amount##":details.amount,
							"##symbol##":details.currency.toUpperCase(),
							"##address##":details.receiveaddress,
							'##date##':Helper.dateToDMY(new Date()),
							"##message##":details.description,
						}, subject_data = {};
						Mailer.send({to:Encrypter.decrypt_data(response.email), changes:mail_data, subject:subject_data, template:'withdraw_request_crypto'})	
						res.status(201).send({status:true, code:200, message:'Order placed successfully.', orderId:order_placed._id})
					}else if(!order_placed){
						avail_amount = balance.amount + parseFloat(details.amount);
						hold_amount = balance.hold - parseFloat(details.amount);
					 	var refund_updation = await wallet.updateOne({userId:response._id, 'wallet.currency':details.currency}, {$set:{'wallet.$.amount':avail_amount, 'wallet.$.hold':hold_amount}}).exec();
						res.status(201).send({status:false, code:400, message:'Order not placed. Please try later'})
					}else
						res.status(201).send({status:false, code:400, message:'server not found'})
					})
				}else if(wallet_updation.nModified == 0)
					res.status(201).send({status:false, code:400, message:'Your transaction was denied. Unable to update your wallet'})
				else
					res.status(201).send({status:false, code:400, message:'server not found'})			
			}
		// }else
		// 	res.status(201).send({status:false, code:400, message:'OTP expired'})			
		// })
	}
		
}
}

module.exports._approve_withdraw = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	var order_id = req.body.id || req.params.id;
	crypto.findOne({_id:order_id}, (err, response)=>{
	if(err)
		res.status(201).send({status:false, code:400, message:'server not found'})	
	else if(!response)
		res.status(201).send({status:false, code:400, message:'No result found'})
	else if(response.status == 1)
		res.status(201).send({status:false, code:400, message:'This transaction was already completed'})
	else if(response.status == 0)
		res.status(201).send({status:false, code:400, message:'This transaction was already cancelled'})
	else{
		custom.approve(response, (cb_response)=>{
			res.status(201).send(cb_response)
		})
	}
	})
}
};

module.exports._cancel_withdraw = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	var result = await crypto.findOne({_id:req.body.id}).exec();
	var user_data = await user.findOne({_id:result.userId}).exec()
	var wallet_data = await wallet.findOne({userId:result.userId, 'wallet.currency':result.currency}, {'wallet.$':1}).exec();
	if(!result)
		res.status(201).send({status:false, code:400, message:'No result found'})
	else if(result.status == 1)
		res.status(201).send({status:false, code:400, message:'This transaction was already completed'})
	else if(result.status == 0)
		res.status(201).send({status:false, code:400, message:'This transaction was already cancelled'})
	else if(result.status == 2){
		var user_email = Encrypter.decrypt_data(user_data.email);
		var wallet_amount = wallet_data.wallet[0].amount + result.amount;
		var hold_amount = wallet_data.wallet[0].hold - result.amount;
		var update_wallet = await wallet.updateOne({userId:result.userId, 'wallet.currency':result.currency}, {$set:{'wallet.$.amount':wallet_amount, 'wallet.$.hold':hold_amount}}).exec();
		var reason = req.body.reason;
		var update_order = await crypto.updateOne({_id:result._id}, {$set:{status:0, reason:reason}}).exec();
		var mail_data = {
			"##date##":Helper.dateToDMY(new Date()),
			"##user##":user_data.firstname,
			"##amount##":result.amount,
			"##symbol##":result.currency.toUpperCase(),
			"##reason##":reason,
		}, subject_data ={ };
		Mailer.send({to:user_email, changes:mail_data, subject:subject_data, template:'withdraw_cancel'});
		res.send({status:true, code:400, message:'Transaction cancelled successfully. Amount refunded to your wallet'})					
	}
	else
		res.send({status:false, code:400, message:'This transaction already exist'})					
	}
}

var explorer_list = {
	"btc":`https://www.blockchain.com/btc/tx/`,
	"eth":`https://etherscan.io/tx/`,
	"ltc":`https://www.blockchain.com/ltc/tx/`,
	"bch":`https://www.blockchain.com/bch/tx/`,
	"doge":`https://dogechain.info/tx/`,
	"dash":`https://explorer.dash.org/insight/tx/`,
	"zec":`https://explorer.zcha.in/transactions/`,
	"xrp":`https://livenet.xrpl.org/transactions/`,
	"bnb":`https://binance.mintscan.io/txs/`,
	"xlm":`https://stellarscan.io/transaction/`,
	"waves":`https://wavesexplorer.com/tx/`,
	"trx":`https://tronscan.org/#/transaction/`,
	"iota":`https://explorer.iota.org/mainnet/transaction/`,
	"icx":`https://tracker.icon.foundation/transaction/`,
	"etc":`https://etcblockexplorer.com/tx/`,
	"xrp":`https://xrpscan.com/ledger/`
};

async function get_admin_address(coin){
	var address = '';
	if(coin == "btc")
		address = _bitcoin['btc'].address.slice(1, -1);
	else if(coin == "eth")
		address = _ether['eth'].address.slice(1, -1);
	else if(coin == "btc")
		address = _tron['trx'].address.slice(1, -1);
	else if(coin == "btc")
		address = _ripple['xrp'].address.slice(1, -1);
	else if(coin == "btc")
		address = _binance['bnb'].address.slice(1, -1);
	else if(coin == "usdt")
		address = _ether['eth'].address.slice(1, -1);
	else
		address = address;

	return address;
}

var custom = {
	approve:async function(response,  callback){
		var withdraw_coin = response.currency.toLowerCase();
		var user_data = await user.findOne({_id:response.userId}).exec();
		var receiver = await get_admin_address(withdraw_coin)
		Crypto._get_balance(withdraw_coin, receiver, (hadBalance)=>{
		if(hadBalance.status){
			if(hadBalance.data.result == 0 || hadBalance.data.result < response.actualamount)
				// Helper.balance_notification(response.currency.toUpperCase(), admin_config.admin_data["mobile"], (result)=>{
				// 	console.log('Insufficient balance')
				// 	var mail_data = {
				// 		"##coin##":response.currency.toUpperCase(),
				// 		"##date##":Helper.dateToDMY(new Date())
				// 	}, subject_data = {};
				// 	var send_mail = Mailer.send({to:admin_config.admin_data["email"], changes:mail_data, subject:subject_data, template:'balance_alert'})	
					callback({status:true, code:201, message:'Your transaction will complete within 24 hour'})	
				// })
			else{
				var response_data = {
					currency:withdraw_coin,
					address:response.receiveaddress,
					amount:response.actualamount,
					tag:response.receiverTag
				};
				Crypto.deposit(response_data, async(moved)=>{
				if(!moved.status){
					callback({status:true, code:201, message:'Your transaction will complete within 24 hour'})	
				}
				else{
					var details = {hash:moved.hash, status:1};
					if(moved.fee !== undefined && moved.fee !== null && moved.fee !== ''){
						if(response.currency.toLowerCase() == "usdt"){
							details.feeCurrency = 'eth';
							details.fee = details.fee - moved.fee;
							details.mainFee = moved.fee;
														
						}else{
							details.mainFee = moved.fee;
							details.fee = details.fee - moved.fee;
							details.feeCurrency = response.currency.toLowerCase();
						}
					};
					var profit_data = {
						category:'send', 
						currency:response.currency.toLowerCase(), 
						profit:response.fee, 
						reference:response._id
					};
					update_wallet(response);
					update_order(response, details);
					var make_profit = await profit.create(profit_data)
					var mail_data = {
						"##user##":response.profileUpdated == true?response.firstname:'',
						"##coin##":response.currency.toUpperCase(),
						"##date##":Helper.dateToDMY(new Date()),
						"##amount##":`${response.amount} ${response.currency.toUpperCase()}`,
						"##from##":response.sendaddress,
						"##to##":response.receiveaddress,
						"##txnid##":details.hash,
						"##fee##":`${response.fee} ${response.currency.toUpperCase()}`,
						"##actamt##":`${response.actualamount} ${response.currency.toUpperCase()}`,
						"##state##":"Success",
						"##message##":response.description,
					}, subject_data = {
						"##coin##":response.currency.toUpperCase()
					};
					Mailer.send({to:response.email, changes:mail_data, subject:subject_data, template:'withdraw'})	
					callback({status:true, code:200, message:'Your withdraw completed successfully. Amount sent to user '+ response.receiveaddress});	
				}
				})		
			}
		}else{
			callback({status:true, code:201, message:'Your transaction will complete within 24 hour'})	
		}
		})
	},
}

async function update_order(order_data, changes){
	var details = {
		hash:changes.hash,
		status:changes.status,
		explorer:`${explorer_list[order_data.currency]}${changes.hash}`
	};
	var update_order_data = await crypto.updateOne({_id:order_data._id}, {$set:details}).exec();
	return;
}

async function update_wallet(order_data){
	wallet.findOne({userId:order_data.userId, 'wallet.currency':order_data.currency}, {'wallet.$':1}, async(err, wallet_data)=>{
	if(wallet_data){
		var balance = wallet_data.wallet[0];
		var hold_amount = balance.hold - order_data.amount;
		var updat_wallet_data = await wallet.updateOne({userId:order_data.userId, 'wallet.currency':order_data.currency}, {$set:{'wallet.$.hold':hold_amount}}).exec();
		return;
	}else
		update_wallet(order_data)	
	})
}
