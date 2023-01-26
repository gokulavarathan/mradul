const express = require('express');
var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
};

var	Middleware = { 
	Template:require('../../UVSVklDRSFTElG/admin/template')
};

let router = express.Router();

router.get(
	'/api/v1/email-template/list', 
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Template.list
);

router.get(
	'/api/v1/email-template/view/:id',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Template.view
)

router.get(
	'/api/v1/email-template/change/:id', 
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	// Helper.Auth.verify_permission, 
	Middleware.Template.change
);

router.get(
	'/api/v1/email-template/remove/:id', 
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	// Helper.Auth.verify_permission, 
	Middleware.Template.delete
);

router.get(
	'/api/v1/email-template/all/:status',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Auth.verify_permission, 
	Middleware.Template.update_all
);

router.post(
	'/api/v1/email-template/update', 
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	// Helper.Auth.verify_permission, 
	Middleware.Template.update
);

module.exports = router;