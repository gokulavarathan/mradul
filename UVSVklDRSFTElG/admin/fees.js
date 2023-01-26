var fees = require('../../model/fees'),
	setting = require('../../model/site');

var	Common = require('../../helper/common');

module.exports.list = (req,res)=>{
	if(Common._validate_origin(req, res)){
	var filter = Object.keys(req.query).length == 0?{}:req.query;
	fees.aggregate([{$match:filter}, {$project:{user:1, type:1, level:1, udate:1}}, {$sort:{level:1}}], (err, response)=>{
	if(response.length > 0)	
		res.status(201).send({status:true, code:200, data:response})
	else if(response.length == 0)
		res.status(201).send({status:false, code:400, data:response, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
}
}

module.exports.view = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	fees.findOne({_id:req.params.id}, (err, response)=>{
	if(response){
		fees.findOne({level:response.level-1}, (err, nxt_level)=>{
			res.status(201).send({status:true, code:200, data:response, nxt_level:nxt_level});			
		})
	}
	else if(!response)
		res.status(201).send({status:false, code:400, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
}
}

module.exports.show = async(req,res)=>{
	//if(Common._validate_origin(req, res)){
	fees.aggregate([{$project:{type:1, level:1, trade_volume:1, noc_balance:1, makerfee:1, takerfee:1, condition:1}}, {$sort:{level:1}}], (err, response)=>{
	if(response)
		res.status(200).send({status:true, code:200, data:response});
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
//}
}

module.exports.update = (req,res)=>{
	//if(Common._validate_origin(req, res)){
	if(req.body._id == undefined || req.body._id == null || req.body._id == ''){
		fees.findOne({user:req.body.user, type:req.body.type, level:req.body.level}, (err, response)=>{
		if(response)
			res.status(201).send({status:false, code:400, message:'Fee already exists'})
		else if(!response){
			req.body.date = new Date();
			fees.create(req.body, (err, created)=>{
			if(created)
				res.status(201).send({status:true, code:200, message:'Fee details added successfully'})
			else
				res.status(201).send({status:false, code:400, message:'Fee details not added'})
			})
		}else
			res.status(201).send({status:false, code:401, message:'server not found'})
		})
	}
	else{
		fees.updateOne({_id:req.body._id}, {$set:req.body}, (err, updated)=>{
		if(updated.nModified == 1)
			res.status(200).send({status:true, code:200, message:'Fees updated successfully'})
		else if(updated.nModified == 0)
			res.status(201).send({status:true, code:400, message:'Already upto date. No changes found'})
		else
			res.status(201).send({status:false, code:401, message:'server not found'})
		})
	}
//}
}