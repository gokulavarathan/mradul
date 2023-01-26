var express = require('express');

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
};

var Middleware = {
	Subadmin:require('../../UVSVklDRSFTElG/admin/subadmin')
};

var router = express.Router();

router.get(
	'/api/v1/subadmin/list',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Subadmin.subadmin_list
);

router.get(
	'/api/v1/subadmin/change-status/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Subadmin.change_subadmin_status
);

router.get(
	'/api/v1/subadmin/details/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Subadmin.subadmin_data
);

router.get(
	'/api/v1/subadmin/remove/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Subadmin.remove_subadmin
);

router.post(
	'/api/v1/subadmin/add-new',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Validator.add_subadmin,
	Middleware.Subadmin.add_subadmin
);

router.post(
	'/api/v1/subadmin/update',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Validator.validate_subadmin,
	Middleware.Subadmin.update_subadmin
);

module.exports = router;