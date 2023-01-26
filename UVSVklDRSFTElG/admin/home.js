var path = require('path'),
	mongoose = require('mongoose');

var home = require('../../model/home'),
	block = require('../../model/blocklist');

var	Common = require('../../helper/common');

module.exports.download_file = (req, res)=>{
	res.sendFile(path.join(__dirname, "../public/uploads/"+req.params.name));
}

module.exports.view = (req,res)=>{
	if(Common._validate_origin(req, res)){
	home.findOne({_id:req.params.id},(err,response)=>{
	if(response)
		res.send({status:true, code:200, data:response})
	else if(!response)
		res.send({status:false, code:200, message:'No results found'})
	else
		res.send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.update = (req,res)=>{
	if(Common._validate_origin(req, res)){
	if(req.body._id == undefined || req.body._id == null ||  req.body._id == ''){
		req.body.category = req.params.category;
		home.create(req.body, (err, created)=>{
		if(created)
			res.send({status:true, code:200, message:'Homepage content updated successfully'})	
		else if(!created)
			res.send({status:false, code:400, message:'Homepage content not updated'})
		else
			res.send({status:false, code:400, message:'server not found'})
		})
	}
	else{
		home.updateOne({_id:req.body._id},{$set:req.body},(err, response)=>{
		if(response.nModified == 1)
			res.send({status:true, code:200, message:'Homepage content updated successfully'})
		else if(response.nModified == 0)			
			res.send({status:false, code:200, message:'Already up to date. No changes found'})
		else 
			res.send({status:false, code:400, message:'server not found'})	
		})
	}
}
}

module.exports.block = (data, cb)=>{
	if(Common._validate_origin(req, res)){
	home.find({address:data}, (err, find)=>{
	if(find)
		cb({status:true, message:'Your IP was blocked'})	
	else
		cb({status:false})
	})
}
}

module.exports.remove_cms = (req,res)=>{
	if(Common._validate_origin(req, res)){
	var id = req.params.id;
	home.deleteOne({_id:id}, (err,results)=>{
	if(results)
		res.status(200).send({status:true, code:200, message:'Content deleted successfully'})	
	else
		res.status(201).send({status:false, code:400, message:'Content not removed'})
	})
}
}

module.exports.cms_list = (req, res)=>{
	if(Common._validate_origin(req, res)){
	home.find({category:req.params.category}).sort({date:-1}).then((results)=>{
		res.status(200).send({status:true, data:results, code:200})	
	}).catch(error=>{
		res.status(200).send({status:false, code:400, message:'server not found'})
	})
}
}

module.exports.verify_ip_block = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	block.findOne({name:req.body.ipaddress}, (err, response)=>{
	if(response)	
		res.send({status:true, block:true, message:'Your ip is blocked', ipaddress:req.body.ipaddress});
	else
		res.send({status:true, block:false})
	})
}
}