var blog = require('../../model/blog'),
	user = require('../../model/user'),
	category = require('../../model/faq-category');


var socket = require('../../helper/config'),
	helper = require('../../helper/helper');



module.exports.list = (req,res)=>{
	var filter = {};
	if(req.headers.tag !== undefined && req.headers.tag !== null && req.headers.tag !== '' && req.headers.tag !== 'web')
		filter = {};
	else
		filter = {status:true};

	blog.aggregate([{$match:filter}, {$project:{blogurlslug:'$url', banner:1, title:1, description:1, status:1, date:1, category:1, url:1}}, {$sort:{date:-1}}],  (err,response)=>{
	if(response.length > 0){
		var latest = response.length > 0?response[0]:{};
		res.status(200).send({status:true, code:200, data:response, latest:latest})
	}else if(response.length == 0)
		res.status(200).send({status:false, code:200, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'Server not found'})
	})
}

module.exports.category_based_list = async(req, res)=>{
	blog.aggregate([{$match:{category_url:req.params.id}}, {$project:{url:1, banner:1, title:1, description:1, status:1, date:1, category:1}}, {$sort:{date:-1}}], (err, response)=>{
	if(response.length > 0)
		res.status(200).send({status:true, code:200, data:response})
	else if(response.length == 0)
		res.status(200).send({status:false, code:200, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'Server not found'})
	})
}

module.exports.tag_based_list = async(req, res)=>{
	blog.aggregate([{$match:{'tags.url':{$in:[req.params.id]}}}, {$project:{url:1, banner:1, title:1, description:1, status:1, date:1, category:1, category_url:1}}, {$sort:{date:-1}}], (err, response)=>{
	if(response.length > 0){
		var title = req.params.id.replace(/-/g,' ');
		res.status(200).send({status:true, code:200, data:response, title:title})
	}else if(response.length == 0)
		res.status(201).send({status:false, code:401, message:'No results found'})
	else
		res.status(201).send({status:false, code:401, message:'Server not found'})
	})
}

module.exports.view = async(req,res)=>{
	var related_post = await blog.aggregate([{$match:{url:{$nin:[req.params.id]}}}, {$project:{category:1, category_url:1, url:1, banner:1, title:1, description:1, status:1, date:1,  _id:0}}, {$sort:{date:-1}}, {$limit:3}]).exec();
	blog.findOne({url:req.params.id}, async(err, response)=>{
	if(err)
		res.status(201).send({status:false, code:401, message:'server not found'})		
	else if(!response)
		res.status(201).send({status:false, code:400, message:'No results found'})
	else{
		var details = {_id:response._id, category:response.category, blogurlslug:response.url, url:response.url, banner:response.banner,
				content:response.content, description:response.description, tag:response.tag, tags:response.tags, status:response.status, meta_key:response.meta_key,
				meta_title:response.meta_title, meta_description:response.meta_description, title:response.title, date:response.date};
		res.status(200).send({status:true, code:200, data:details, related:related_post})
	}
	})
}                             

module.exports.view_info = async(req, res)=>{
	var id = helper.decrypt_data(req.params.id);
	blog.findOne({_id:id}, (err, response)=>{
	if(err)
		res.status(201).send({status:false, code:401, message:'server not found'})		
	else if(!response)
		res.status(201).send({status:false, code:400, message:'No results found'})
	else{
		var details = {category:response.category, blogurlslug:response.url, url:response.url, banner:response.banner,
				content:response.content, description:response.description, tag:response.tag, tags:response.tags, status:response.status, meta_key:response.meta_key,
				meta_title:response.meta_title, meta_description:response.meta_description, title:response.title, date:response.date};
		res.status(200).send({status:true, code:200, data:details})
	}
	})
}

module.exports.change_status = async(req, res)=>{
	var blog_data = await blog.findOne({url:req.params.id}).exec();
	var blog_status = blog_data.status == true?false:true;
	blog.findOne({_id:blog_data._id}, {$set:{status:blog_status}}, (err, updated)=>{
	if(err)
		res.status(201).send({status:false, code:400, message:'Server not found'})
	else if(updated.nModified == 1)	
		res.status(201).send({status:false, code:400, message:'Blog status updated successfully'})
	else 
		res.status(201).send({status:false, code:400, message:'Blog status not updated'})
	})
}

module.exports.update = (req,res)=>{
	req.body.url = req.body.blogurlslug.toLowerCase();
	if(req.body.tags.length > 0){
		req.body.tags = req.body.tags.map(e=>{
			e.url = e.name.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g, "-").replace(/ /g,'-');
			return e;
		})
	}
	if(req.body.category !== undefined && req.body.category !== null && req.body.category !== ''){
		req.body.category_url = req.body.category.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g, "-").replace(/ /g,'-');
	}

	if(req.body._id == undefined || req.body._id == null || req.body._id == ''){
		req.body.date = new Date();
		blog.create(req.body, (err, response)=>{
		if(response)	
			res.status(200).send({status:true, code:200, message:'Blog posted successfully'})
		else if(!response)
			res.status(201).send({status:false, code:400, message:'Unable to post blog'})
		else
			res.status(201).send({status:false, code:400, message:'server not found'})
		})
	}else{
		blog.updateOne({_id:req.body._id}, {$set:req.body}, (err, updated)=>{
		if(updated.nModified == 1)
			res.status(200).send({status:true, code:200, message:'Blog updated successfully'})	
		else if(updated.nModified == 0)
			res.status(201).send({status:false, code:400, message:'Blog not updated'})	
		else
			res.status(201).send({status:false, code:400, message:'server not found'})
		})
	}
}         

module.exports.remove = (req,res)=>{
	blog.deleteOne({url:req.params.id}, (err, deleted)=>{
	if(deleted)
		res.status(200).send({status:true, code:200,  message:'Blog details removed successfully'})	
	else
		res.status(201).send({status:false, code:400, message:'Blog details not removed'})
	})
}

module.exports.blog_change_status_all = (req, res)=>{
	var status = req.params.status === 'true'?true:false;
	blog.updateMany({}, {$set:{status:status}}, (err, updated)=>{
	if(updated)	
		res.status(200).send({status:true, code:200, message:'Blog details updated successfully'})
	else
		res.status(201).send({status:false, code:400, message:'Blog details not updated'})
	})
}

module.exports.deleteAll = (req,res)=>{
	blog.deleteMany({}, (err, deleted)=>{
	if(deleted)
		res.status(200).send({status:true, code:200,  message:'Blogs removed successfully'})	
	else
		res.status(201).send({status:false, code:400, message:'Blogs not removed'})
	})
}

module.exports.related_post = (req,res)=>{
	blog.aggregate([{$match:{category_url:{$in:[req.query.url]}, _id:{$nin:[req.query.id]}}}, {$project:{url:1, banner:1, title:1, description:1, status:1, date:1,  _id:0}}, {$sort:{date:-1}}, {$limit:3}], (err,response)=>{
	if(err)
		res.status(201).send({status:false, code:401, message:'server not found'})
	else if(response.length > 0)
		res.status(200).send({status:true, code:200, data:response})
	else
		res.status(200).send({status:false, code:400, message:"No results found"})
	})
}

module.exports.recent_post = (req, res)=>{
	blog.aggregate([{$match:{status:true}}, {$project:{url:1, title:1,description:1,banner:1,date:1 }}, {$sort:{date:-1}}, {$limit:5}], (err, response)=>{
	if(err)	
	    res.status(201).send({status:false, code:401, message:'server not found'})
	else if(response.length > 0)
		res.status(200).send({status:true, code:200, data:response})
	else
		res.status(200).send({status:false, code:400, message:"No results found"})
	})
}

module.exports.update_comment = (req, res)=>{
	//console.log('req-------->',req)
	var data = {
		email:req.body.email,
		name:req.body.name,
		comment:req.body.comment,
		date:new Date()
	};
	//console.log('data------->',data)
	
	blog.updateOne({url:req.body.url}, {$push:{reviews:data}},(err, comment_updated)=>{
		//console.log('comment_updated------>',err)
	if(comment_updated.nModified == 1)	
		res.status(200).send({status:true, code:200, message:'Your comment updated successfully', data:data})
	else if(comment_updated.nModified == 0)
		res.status(201).send({status:false, code:400, message:'Your comment not updated'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
}

module.exports.update_user_comment = async(req,res)=>{
	var user_data = await user.findOne({email:req.user}).exec();
	var data ={
		email:user_data.email,
		name:user_data.firstname,
		avatar:user_data.avatar,
		comment:req.body.comment,
		date:new Date()
	}
	blog.updateOne({url:req.body.url}, {$push:{reviews:data}},(err, comment_updated)=>{
	if(comment_updated.nModified == 1)	
		res.status(200).send({status:true, code:200, message:'Your comment updated successfully', data:data})
	else if(comment_updated.nModified == 0)
		res.status(201).send({status:false, code:400, message:'Your comment not updated'})
	else
		res.status(201).send({status:false, code:401, message:'server not found'})
	})
}

module.exports.blog_category = (req, res)=>{
	category.aggregate([{$match:{category:"blog"}}, {$project:{main_category:1, url:''}}, {$sort:{date:-1}}], (err, response)=>{
	if(err)
		res.status(201).send({status:false, code:400, message:'No results found'})	
	else{
		response = response.map(e=>{
			e.url = e.main_category.replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g, "-").replace(/ /g,'-').toLowerCase();
			return e;
		})
		res.status(201).send({status:true, code:200, data:response})
	}
	})
}