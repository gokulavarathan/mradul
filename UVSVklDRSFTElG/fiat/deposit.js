var	mongoose = require('mongoose');

var user = require('../../model/user'),
	bank = require('../../model/admin-bank'),
	currency = require('../../model/currency'),
	fiat = require('../../model/fiat'),
	profit = require('../../model/profit'),
	wallet = require('../../model/wallet');

var Helper = require('../../helper/helper'),
	Mailer = require('../../helper/mailer'),
	Common = require('../../helper/common'),
	Encrypter = require('../../helper/encrypter');

// module.exports.place_deposit = async(req, res)=>{
//     if(Common._validate_origin(req, res)){
// 	var date = Helper.dateToYMD(new Date())+'T00:00:00.000Z';
// 	var currency_data = await currency.findOne({type:'fiat', symbol:req.body.currency.toLowerCase()}).exec();
// 	var user_data = await user.findOne({_id:req.user_id}).exec();
// 	var bank_data = await bank.findOne({}).exec();
// 	var deposit_amount = parseFloat(req.body.amount).toFixed(2);
// 	if(!user_data)
// 		res.status(201).send({status:false, code:400, message:'User details not found'})
// 	else if(!user_data.isActive)
// 		res.status(201).send({status:false, code:400, message:'Your account has been locked. Please contact our support'})
// 	else if(!user_data.emailVerified)
// 		res.status(201).send({status:false, code:400, message:'Your account is not yet activated'})
// 	else if(!user_data.profileUpdated)
// 		res.status(201).send({status:false, code:400, message:'Please update your profile details'})
// 	else if(!user_data.bank_status)
// 		res.status(201).send({status:false, code:400, message:'Please add your bank details'})
// 	else if(!currency_data)
// 		res.status(201).send({status:false, code:400, message:'Invalid currency'})
// 	else if(!currency_data.status)
// 		res.status(201).send({status:false, code:400, message:'This currency service temproarily unavailable'})
// 	else if(!currency_data.deposit)
// 		res.status(201).send({status:false, code:400, message:'Deposit currently unavailable for this currency'})
// 	else if(deposit_amount < currency_data.min_deposit)
// 		res.status(201).send({status:false, code:400, message:'Minimum deposit amount is '+currency_data.min_deposit})
// 	else if(deposit_amount < currency_data.deposit_fee)
// 		res.status(201).send({status:false, code:400, message:'Amount should be greater than fee amount'})
// 	else if(currency_data.deposit){
// 		var data = {
// 			email:Encrypter.decrypt_data(user_data.email),
// 			userId:req.user_id,
// 			currency:req.body.currency.toLowerCase(),
// 			amount:deposit_amount,
// 			actualamount:deposit_amount,
// 			paymentMethod:req.body.method,
// 			fee:0,
// 			mainFee:0,
// 			proof:req.body.proof,
// 			category:'deposit',
// 			gateway:"bank",
// 			comment:req.body.comment,
// 			remarks:req.body.remarks,
// 			date:new Date(),
// 			submittedBy:user_data._id,
// 			submitterName:user_data.firstname,
// 			bank:{
// 				account_type:bank_data.account_type,
// 				accNumber:bank_data.acc_number,
// 				bankname:bank_data.bankname,
// 				ibanCode:bank_data.ifsc_code,
// 				holder:bank_data.holder
// 			},
// 			paymentId:req.body.transactionid.toUpperCase(),
// 			status:2
// 		};
// 		fiat.findOne({paymentId:data.paymentId}, (err, response)=>{
// 		if(!response){
// 			fiat.create(data, (err, order_created)=>{
// 			if(order_created){
// 				// var notify_admin = {
// 				// 	email:'admin',
// 				// 	message:`${data.email} placed a deposit for ${data.amount} ${data.currency.toUpperCase()}`,
// 				// 	date:new Date(),
// 				// 	tag:'transfer',
// 				// 	referenceId:order_created._id
// 				// };
// 				// Helper.send_notification(notify_admin);
// 				res.status(201).send({status:true, code:200, message:'Your deposit order placed successfully'})
// 			}
// 			else if(!order_created)
// 				res.status(201).send({status:false, code:400, message:'Your order not placed'})
// 			else
// 				res.status(201).send({status:false, code:401, message:'server not found'})
// 			})
// 		}else
// 			res.status(201).send({status:false, code:401, message:'Payment reference has already being taken'})	
// 		})
// 	}
// 	else
// 		res.status(201).send({status:false, code:400, message:'server not found'})
// }
// }
module.exports.place_deposit = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var date = Helper.dateToYMD(new Date())+'T00:00:00.000Z';
	var currency_data = await currency.findOne({type:'fiat', symbol:req.body.currency.toLowerCase()}).exec();
	var user_data = await user.findOne({_id:req.user_id}).exec();
	var bank_data = await bank.findOne({}).exec();
	var deposit_amount = parseFloat(req.body.amount).toFixed(2);
	if(!user_data)
		res.status(201).send({status:false, code:400, message:'User details not found'})
	else if(!user_data.isActive)
		res.status(201).send({status:false, code:400, message:'Your account has been locked. Please contact our support'})
	else if(!user_data.emailVerified)
		res.status(201).send({status:false, code:400, message:'Your account is not yet activated'})
	else if(!user_data.profileUpdated)
		res.status(201).send({status:false, code:400, message:'Please update your profile details'})
	else if(!user_data.bank_status)
		res.status(201).send({status:false, code:400, message:'Please add your bank details'})
	else if(!currency_data)
		res.status(201).send({status:false, code:400, message:'Invalid currency'})
	else if(!currency_data.status)
		res.status(201).send({status:false, code:400, message:'This currency service temproarily unavailable'})
	else if(!currency_data.deposit)
		res.status(201).send({status:false, code:400, message:'Deposit currently unavailable for this currency'})
	else if(deposit_amount < currency_data.min_deposit)
		res.status(201).send({status:false, code:400, message:'Minimum deposit amount is '+currency_data.min_deposit})
	else if(deposit_amount < currency_data.deposit_fee)
		res.status(201).send({status:false, code:400, message:'Amount should be greater than fee amount'})
	else if(currency_data.deposit){
		var data = {
			email:Encrypter.decrypt_data(user_data.email),
			userId:req.user_id,
			currency:req.body.currency.toLowerCase(),
			amount:deposit_amount,
			actualamount:deposit_amount,
			paymentMethod:req.body.method,
			fee:0,
			mainFee:0,
			proof:req.body.proof,
			category:'deposit',
			gateway:"bank",
			comment:req.body.comment,
			remarks:req.body.remarks,
			date:new Date(),
			submittedBy:user_data._id,
			submitterName:user_data.firstname,
			bank:{
				account_type:bank_data.account_type,
				accNumber:bank_data.acc_number,
				bankname:bank_data.bankname,
				ibanCode:bank_data.ifsc_code,
				holder:bank_data.holder
			},
			paymentId:req.body.transactionid.toUpperCase(),
			status:2
		};
		fiat.findOne({paymentId:data.paymentId}, (err, response)=>{
		if(!response){
			fiat.create(data, (err, order_created)=>{
			if(order_created){
				// var notify_admin = {
				// 	email:'admin',
				// 	message:`${data.email} placed a deposit for ${data.amount} ${data.currency.toUpperCase()}`,
				// 	date:new Date(),
				// 	tag:'transfer',
				// 	referenceId:order_created._id
				// };
				// Helper.send_notification(notify_admin);
				res.status(201).send({status:true, code:200, message:'Your deposit order placed successfully'})
			}
			else if(!order_created)
				res.status(201).send({status:false, code:400, message:'Your order not placed'})
			else
				res.status(201).send({status:false, code:401, message:'server not found'})
			})
		}else
			res.status(201).send({status:false, code:401, message:'Payment reference has already being taken'})	
		})
	}
	else
		res.status(201).send({status:false, code:400, message:'server not found'})
}
}

module.exports.approve_deposit = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	var order_id = mongoose.Types.ObjectId(req.params.id)
	var request_data = await fiat.findOne({_id:order_id, category:"deposit"}).exec();
	if(!request_data)
		res.status(201).send({status:false, code:400, message:'Transaction not found'});
	else if(request_data.status == 1)
		res.status(201).send({status:false, code:400, message:'Transaction has been already completed'})
	else if(request_data.status == 0)
		res.status(201).send({status:false, code:400, message:'Transaction has been already cancelled'})
	else if(request_data.status == 2){
		var user_data = await user.findOne({_id:request_data.userId}).exec();
		var wallet_data = await wallet.findOne({userId:request_data.userId, 'wallet.currency':request_data.currency.toLowerCase()}, {'wallet.$':1}).exec();
		var user_email = Encrypter.decrypt_data(user_data.email)
		var user_email = Encrypter.decrypt_data(user_data.email)
		fiat.updateOne({_id:request_data._id}, {$set:{status:1, remarks:'Order approved. Amount updated successfully'}}, async(err, update_order)=>{
		if(update_order.nModified == 1){
			var amount = wallet_data.wallet[0].amount + request_data.actualamount;
			var update_wallet = await wallet.updateOne({userId:request_data.userId, 'wallet.currency':request_data.currency.toLowerCase()}, {$set:{'wallet.$.amount':amount}}).exec()
			var mail_data = {
				"##coin##":request_data.currency.toUpperCase(),
				"##user##":user_data.firstname,
				"##txnid##":request_data.paymentId,
				"##amount##":request_data.actualamount,
				"##fee##":request_data.fee,
				"##state##":"Success",
				"##message##":request_data.comment,
				"##date##":Helper.dateToDMY(new Date())
			}, subject_data = {"##coin##":request_data.currency.toUpperCase()};
			Mailer.send({to:user_email, changes:mail_data, subject:subject_data, template:'deposit'})
			res.status(200).send({status:true, code:200, message:'Order completed successfully'})
		}else	
			res.status(200).send({status:false, code:400, message:"Please try later"})
		})
	}
	else{
		res.status(201).send({status:false, code:400, message:'Transaction already has been completed or cancelled.'})
	}
}	
}

module.exports.cancel_deposit = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var order_id = mongoose.Types.ObjectId(req.body.id)
	var request_data = await fiat.findOne({_id:order_id, category:"deposit"}).exec();
	var user_data = await user.findOne({_id:request_data.userId}).exec();
	if(!request_data)
		res.status(201).send({status:false, code:400, message:'Transaction not found'});
	else if(request_data.status == 1)
		res.status(201).send({status:false, code:400, message:'Transaction has been already completed'})
	else if(request_data.status == 0)
		res.status(201).send({status:false, code:400, message:'Transaction has been already cancelled'})
	else if(request_data.status == 2){
		var user_email = Encrypter.decrypt_data(user_data.email)
		var reason = req.body.message || req.body.reason;
		fiat.updateOne({_id:request_data._id}, {$set:{status:0, reason:reason}}, async(err, update_order)=>{
		if(update_order.nModified == 1){
			var mail_data = {
				"##symbol##":request_data.currency.toUpperCase(),
				"##user##":user_data.firstname,
				"##amount##":request_data.amount,
				"##reason##":reason,
				"##date##":Helper.dateToDMY(new Date())
			}, subject_data = {"##coin##":request_data.currency.toUpperCase(), "##amount##":request_data.amount, "##symbol##":request_data.currency.toUpperCase()};
			Mailer.send({to:user_email, changes:mail_data, subject:subject_data, template:'deposit_cancel'})
			res.status(200).send({status:true, code:200, message:'Order cancelled successfully'})
		}else	
			res.status(200).send({status:false, code:400, message:"Please try later"})
		})
	}	
	else{
		res.status(201).send({status:false, code:400, message:'Transaction already has been completed or cancelled.'})
	}
}
}