var express = require('express'),
	Request = require('request'),
	cron = require('node-cron'),
	cloudinary = require('cloudinary').v2,
	path = require('path'),
	multer = require('multer'), 
	fs = require('fs'),
	http = require('http'),
	MAIL_ENC = require('simple-encryptor')(process.env.ENCR_API_KEY);

var Helper = {
	Auth:require('../../helper/auth'),
	Helper:require('../../helper/helper'),
	Validator:require('../../helper/validator'),
	Config:require('../../QRklHLVNFRFWE/Q0xPVURfREFUQQ'),
	Keys:require('../../QRklHLVNFRFWE/keyfile')
};

var	Middleware = {
	Home:require('../../UVSVklDRSFTElG/admin/home'),
	Newsletter:require('../../UVSVklDRSFTElG/admin/home'),
};

var Config = {
	Cloud:require('../../QRklHLVNFRFWE/Q0xPVURfREFUQQ')
}

var router = express.Router();
var storage = multer.diskStorage({destination:'./public/uploads/', filename: (req, file, cb) => { cb(null, file.originalname) } });
var upload = multer({storage:storage})

cloudinary.config({ 
    cloud_name  : Config.Cloud.cloud.buck_name, 
    api_key     : Config.Cloud.cloud.key, 
    api_secret  : Config.Cloud.cloud.access_key
});

router.get(
	'/file/:name', 
	Middleware.Home.download_file
);

router.get(
	'/api/v1/cms/view/:id', 
	Helper.Auth.verify_origin, 
	Middleware.Home.view
)

router.get(
	'/api/v1/cms/list/:category', 
	Helper.Auth.verify_origin, 
	Middleware.Home.cms_list
)

router.get(
	'/api/v1/cms/remove/:id',
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Home.remove_cms
)

router.post(
	'/api/v1/cms/update/:category', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Home.update
)

router.post('/upload-file', Helper.Auth.verify_origin, upload.single('fileKey'), (req,res)=> {
	cloudinary.uploader.upload(req.file.path, (error,result)=>{ 
    if(result)
		res.send({status:true, data:result})
	else
	{
		console.log("Error in cloud", error)
		res.send({ status: false, message: 'Network error. Please try later' })
	}
	})
})

router.post(
	'/upload-file-to-cloud', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	upload.single('fileKey'), 
	(req, res)=>{
	cloudinary.uploader.upload(req.file.path, (error,result)=>{ 
	if(result)
		res.send({status:true, data:result})
	else
		res.send({status:false,message:'Network error. Please try later'})
	})
})

module.exports = router;