var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

router.get(
	'/api/v1/admin/profile',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.profile
);

module.exports = router;