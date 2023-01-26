var mongoose = require('mongoose'),
	Async = require('async');

var Common = require('../../helper/common'),
	helper = require('../../helper/helper');

var	faq_category = require('../../model/faq-category'),
	faq_content = require('../../model/faq'),
	site = require('../../model/site');

module.exports.remove_faq_category = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var id = mongoose.Types.ObjectId(req.params.id);
	faq_category.deleteOne({_id:id}, (err, deleted)=>{
	if(deleted)
		res.status(200).send({status:true, code:200, message:'Deleted successfully'})	
	else
		res.status(201).send({status:false, code:401, message:'Server not found'})
	})
 }
}

module.exports.faq_category = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	Async.parallel({
		faq_list:function(cb){
			faq_category.find({status:true, category:'faq'}, {main_category:1, icon:1}).exec(cb)
		},
	}, (err, response)=>{
	if(response){
		res.status(200).send({status:true, code:200, data:response})
	}else
		res.status(201).send({status:false, code:400, message:'server not found'})	
	})
//}
}

module.exports.support_category_list = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	var result = await faq_category.aggregate([
		{$match:{status:true, category:{$in:['faq','announcement']}}},
		{$lookup:{from:'RkFRLUxpcQ', localField:'_id', foreignField:'mainCategory', as:'faq_data'}},
		{$project:{icon:1, main_category:1, _id:1, content_lists:'$faq_data'}}
	]).exec()
    result = result.map(el=>{
		el.sub_category = el.content_lists.map(e=>{
			return obj = {
				url:e.url,
				category:e.title,
				title:e.title,
				author:e.author
			};
		})

		delete el.content_lists;
		return el;
	})

	res.status(200).send({status:true, code:200, data:result})
//}
}

module.exports.support_details = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	var site_info = await site.findOne({}).exec();
	//console.log('site_info-------->',site_info)
	console.log('req.params.id-------->',req.params.id)
	faq_content.findOne({url:req.params.id.toLowerCase()}, (err, response)=>{
		console.log('response==>',response)
	if(response){
		response.logo = site_info.logo
		res.status(200).send({status:true, code:200, data:response})
	}	
	else if(!response)
		res.status(201).send({status:false, code:400, message:'No results found'})
	else
		res.status(201).send({status:false, code:400, message:'server not found'})
	})
//}
}

module.exports.announcement_list = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	faq_category.aggregate([
		{$match:{status:true, category:'announcement'}}, 
		{$lookup:{from:'RkFRLUxpcQ', localField:'_id', foreignField:'mainCategory', as:'faqData'}}, 
		{$project:{category:'$main_category', faq_data:'$faqData', icon:1}}], (err, response)=>{
	if(response.length > 0){
		response = response.map(function(el){
			el.faq_data = el.faq_data.map(function(ele){
				var obj = {};
				obj.title = ele.title;
				obj.url = ele.url;

				delete ele;
				return obj;
			})
			res.status(200).send({status:true, code:200, data:response})
		})
	}else if(response.length == 0)
		res.status(201).send({status:true, code:400, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
//}
}

module.exports.faq_category_list = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	var filter = req.headers.tag !== 'web'?{}:{category:"support"};
	faq_category.find(filter, (err, response)=>{
	if(response)
		res.status(200).send({status:true, code:200, data:response})	
	else
		res.status(201).send({status:false, code:400, message:'server not found'})
	})
//}
}

module.exports.faq_details = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	faq_content.find({}, (err, response)=>{
	if(response)	
		res.status(200).send({status:true, code:200, data:response})	
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
//}
}

module.exports.update_category = async(req, res)=>{
//if(Common._validate_origin(req, res)){
	req.body.id = req.body.main_category.replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g, "-").replace(/ /g,'-').toLowerCase();
	var avail = await faq_category.findOne({id:req.body.id}).exec()
	
	if(req.body._id == undefined || req.body._id == null || req.body._id == ''){
		if(!avail){
			faq_category.create(req.body, (err, created_response)=>{
			
			if(created_response)	
				res.status(200).send({status:true, code:200, message:'FAQ category created successfully'})
			else if(!created_response)
				res.status(200).send({status:false, code:200, message:'FAQ category not created'})
			else
				res.status(201).send({status:false, code:401, message:'server not found'})
			})
		}else
			res.status(201).send({status:false, code:400, message:"Category already exists"})
	}else{
		faq_category.updateOne({_id:req.body._id}, {$set:req.body}, (err, created_response)=>{
		if(created_response.nModified == 1)	
			res.status(200).send({status:true, code:200, message:'FAQ category updated successfully'})
		else if(created_response.nModified == 0)
			res.status(200).send({status:true, code:200, message:'FAQ category not updated1'})
		else
			res.status(201).send({status:false, code:401, message:'server not found'})
		})
	}
//}
}

module.exports.faq_content_list = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	faq_category.aggregate([
		{$match:{_id:req.params._id}}, 
		{$unwind:'$sub_category'}, 
		{$lookup:{from:'faq',  localField:'sub_category.url', foriengField:'subCategory', as:'faq_data'}}, 
		{$project:{category:'$sub_category.category', list:'$faq_data'}}], (err, response)=>{
	if(response){
		response = response.map(function(el){
			el.list = el.list.map(function(ele){ 
				var obj = {};
				obj.title = ele.title;
				obj._id = ele._id;

				delete ele;
				return obj; 
			})
			return el;
		})

		res.status(200).send({status:true, code:200, data:response})
	}else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
}
}

module.exports.faq_list = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	faq_content.find({}, {type:1, title:1, date:1, status:1}).sort({date:-1}).then((response)=>{
		res.status(200).send({status:true, code:200, date:response})
	}).catch((error)=>{
		res.status(201).send({status:false, code:400, message:'server not found'})
	})	
//}
}

module.exports.faq_content_details = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
	faq_content.findOne({_id:req.params.id}, (err, response)=>{
	if(response)	
		res.status(200).send({status:true, code:200, data:response})
	else if(!response)
		res.status(200).send({status:true, code:200, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
//}
}

module.exports.update_faq_status = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
faq_content.findOne({_id:req.params.id}, {status:1}, (err, response)=>{
	if(response){
		var status = response.status?false:true;
		faq_content.updateOne({_id:response._id}, {$set:{status:status}}, (err, updated)=>{
		if(updated.nModified == 1)	
			res.status(200).send({status:true, code:200, message:'Status updated successfully'})
		else
			res.status(200).send({status:false, code:400, message:'Status not updated'})
		})
	}
	else
		res.status(200).send({status:true, code:400, message:'server not found'})
	})
//}
}

module.exports.remove_faq = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var id = mongoose.Types.ObjectId(req.params.id);
	var faq_data = await faq_content.findOne({_id:id}).exec()
	faq_content.deleteOne({_id:id}, (err, deleted)=>{
	if(deleted)	
		res.status(200).send({status:true, code:200, message:'FAQ deleted successfully'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
}
}

module.exports.update_faq_content = async(req, res)=>{
	//if(Common._validate_origin(req, res)){
		if(req.body._id == undefined || req.body._id == null || req.body._id == ''){
		faq_content.create(req.body, (err, created_response)=>{
			console.log(' created_response-------->', created_response)
		if(created_response)
			res.status(200).send({status:true, code:200, message:'FAQ created successfully'})
		else if(!created_response)
			res.status(200).send({status:true, code:200, message:'FAQ not created'})
		else
			res.status(201).send({status:false, code:401, message:'server not found'})
		})
	}else{
		faq_content.updateOne({_id:req.body._id}, {$set:req.body}, (err, created_response)=>{
		if(created_response.nModified == 1)	
			res.status(200).send({status:true, code:200, message:'FAQ updated successfully'})
		else if(created_response.nModified == 0)
			res.status(200).send({status:true, code:200, message:'FAQ not updated'})
		else
			res.status(201).send({status:false, code:401, message:'server not found'})
		})
	}
//}
}