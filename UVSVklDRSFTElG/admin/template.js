var template = require('../../model/template'),
	mongoose = require('mongoose');

var	Common = require('../../helper/common');

module.exports.list = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	template.find({}, {title:1, subject:1, date:1, status:1},(err, response)=>{
	if(response)	
		res.send({status:true, code:200, data:response})
	else
		res.send({status:false, code:400, message:'No results found'})
	})
}
}

module.exports.view = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	template.findOne({_id:req.params.id},(err, response)=>{
	if(response)	
		res.send({status:true, code:200, data:response})
	else
		res.send({status:false, code:400, message:'No results found'})
	})
}
}

module.exports.update = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	if(req.body._id == '' || req.body._id == undefined || req.body._id == null){
		template.findOne({title:req.body.title.toLowerCase()}, (err, exist)=>{
		if(exist)
			res.send({status:true, code:200, message:'Template already exists'})
		else{
			var data = {
				title:req.body.title,
				subject:req.body.subject,
				content:req.body.content,
				date:new Date(),
			};
			template.create(data, (err, response)=>{
			if(response)	
				res.send({status:true, code:200, data:response, message:'Template created successfully'})
			else if(!response)
				res.send({status:false, code:200, message:'Template not created'})
			else
				res.send({status:false, code:400, message:'No results found'})
			})
		}
		})
	}
	else{
		req.body._id = mongoose.Types.ObjectId(req.body._id);
		template.updateOne({_id:req.body._id}, {$set:req.body}, (err, response)=>{
		if(response.nModified == 1)
			res.send({status:true, code:200, message:'Updated successfully'})	
		else if(response.nModified == 0)
			res.send({status:true, code:200, message:'No changes found'})	
		else
			res.send({status:false, code:400, message:'No results found'})
		})
	}
}
}

module.exports.change = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	var template_id = mongoose.Types.ObjectId(req.params.id);
	var template_data = await template.findOne({_id:template_id}).exec();
	let status = template_data.status == true?false:true; 
	template.updateOne({_id:req.params.id}, {$set:{status:status}}, (err, response)=>{
	if(response.nModified == 1)
		res.send({status:true, code:200, message:'Updated successfully'})	
	else if(response.nModified == 0)
		res.send({status:true, code:200, message:'No changes found'})	
	else
		res.send({status:false, code:400, message:'No results found'})
	})
}
}

module.exports.delete = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	template.deleteOne({_id:req.params.id}, (err, response)=>{
	if(response)
		res.send({status:true, code:200, message:'Deleted successfully'})	
	else
		res.send({status:false, code:400, message:'No results found'})
	})
}
}

 module.exports.update_all = async(req,res)=>{
	if(Common._validate_origin(req, res)){
	template.updateMany({},{$set:{status:req.params.status}}, (err, response)=>{
	if(response.nModified == 0)	
		res.send({status:true, code:200, message:'No changes found'})
	else if(response.nModified > 0)
		res.send({status:true, code:200, message:'Template updated '+response.nModified+'.'})
	else
		res.send({status:false, code:400, message:'server not found'})
	})
}
}