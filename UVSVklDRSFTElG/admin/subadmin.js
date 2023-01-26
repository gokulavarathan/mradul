var mongoose = require('mongoose');

var admin = require('../../model/admin'),
	history = require('../../model/history');

var	Tfa = require('../../helper/2fa'),
	Mailer = require('../../helper/mailer'),
	Helper = require('../../helper/helper'),
	Common = require('../../helper/common'),
	Encrypter = require('../../helper/encrypter');

var Config = require('../../QRklHLVNFRFWE/keyfile');

module.exports.add_subadmin = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var user_email = req.body.email;
	req.body.email = Encrypter.encrypt_data(req.body.email.toLowerCase());
	var exists = await admin.findOne({email:req.body.email}).exec();
	if(!exists){
		Encrypter.password_enc(req.body.password, (encrypted)=>{				
			Tfa.generate_tfa(user_email, async(tfa_data)=>{
				var new_data = {
					username:req.body.username,
					email:req.body.email,
					salt:encrypted.salt,
					password:encrypted.encr.data,
					role:'subadmin',
					pattern:Encrypter.encrypt_data(req.body.pattern),
					tfa:tfa_data,
					permission:req.body.permission,
					created_at:new Date()
				};

				admin.create(new_data, (err, created)=>{
				if(created){	
					var mail_data = {
						"##date##":Helper.dateToDMY(new Date()),
						"##username##":user_email,
						"##password##":req.body.password,
						"##pattern##":req.body.pattern,
						"##htusername##":Config.ht_access.user,
						"##htpassword##":Config.ht_access.pass
					}, subject_data = {};
					Mailer.send({to:user_email, changes:mail_data, subject:subject_data, template:'subadmin'});
					res.status(200).send({status:true, code:200, message:'Subadmin added successfully'})
				}
				else
					res.status(201).send({status:false, code:400, message:'Subadmin not created'})
				});
			})
		})
	}else if(exists)
		res.status(201).send({status:true, code:400, message:'This email already exists'})
	else
		res.status(201).send({status:true, code:400, message:'Server not found'})
}
}

module.exports.update_subadmin = (req, res)=>{
	if(Common._validate_origin(req, res)){
	req.body.email = Encrypter.encrypt_data(req.body.email.toLowerCase());
	admin.updateOne({_id:req.body._id}, {$set:req.body}, (err, response)=>{
	if(response.nModified == 1)	
		res.status(200).send({status:true, code:200, message:'Subadmin updated successfully'})
	else if(response.nModified == 0)
		res.status(201).send({status:true, code:201, message:'Already upto date. No changes found'})
	else
		res.status(201).send({status:false, code:400, message:'Server not found'})
	})
}
}

module.exports.subadmin_list = (req, res)=>{
	if(Common._validate_origin(req, res)){
	admin.find({role:'subadmin'}, {email:1, username:1, created_at:1, avatar:1, isActive:1}, (err, response)=>{
	if(response){
		response = response.map(e=>{
			e.email = Encrypter.decrypt_data(e.email);
			return e;
		})
		res.status(200).send({status:true, code:200, data:response})
	}	
	else
		res.status(201).send({status:false, code:400, message:'Server not found'})
	})
}
}

module.exports.subadmin_data = (req, res)=>{
	if(Common._validate_origin(req, res)){
	admin.findOne({_id:req.params.id}, {password:0, salt:0, pattern:0}, (err, response)=>{
	if(response){
		response.email = Encrypter.decrypt_data(response.email);
		res.status(200).send({status:true, code:200, data:response})
	}else if(!response)
		res.status(201).send({status:false, code:400, message:'No results found'})
	else
		res.status(201).send({status:false, code:400, message:'Server not found'})
	})
}
}

module.exports.change_subadmin_status = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var admin_data = await admin.findOne({_id:req.params.id}).exec();
	var status = admin_data.isActive?false:true;
	admin.updateOne({_id:admin_data._id}, {$set:{isActive:status}}, async(err, updated)=>{
	if(updated.nModified == 1)	{
		if(!status){
			var history_data = await history.find({userId:admin_data._id, category:'admin', status:true}).exec();
			history_data = history_data.map(e=>{
				socket_config.sendmessage('block_account', {message:'Your account has been blocked', status:true, token:e.access_token, block:true})
			})
		}
		res.status(200).send({status:true, code:200, message:'Subadmin updated successfully'})
	}
	else if(updated.nModified == 0)
		res.status(200).send({status:false, code:400, message:'Subadmin not updated'})
	else
		res.status(201).send({status:false, code:401, message:'Server not found'})
	})
}
}

module.exports.remove_subadmin = async(req, res)=>{
	if(Common._validate_origin(req, res)){
	var admin_data = await admin.findOne({_id:req.params.id}).exec();
	var history_data = await history.find({userId:admin_data._id, category:'admin', status:true}).exec();
	var deleteAdmin = await admin.deleteOne({_id:admin_data._id}).exec();
	var deleteLogs = await history.deleteMany({userId:admin_data._id}).exec();
	if(history_data.length > 0){
		history_data = history_data.map(e=>{
			socket_config.sendmessage('block_account', {message:'Your account has been blocked', status:true, token:e.access_token, block:true})
		})
	}
	res.status(200).send({status:true, code:200, message:'Subadmin removed successfully'})
}
}