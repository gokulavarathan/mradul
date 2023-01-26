var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

router.post(
	'/api/v1/admin/login'
	Helper.Auth.verify_origin,
	Helper.Validator.login,
	Middleware.User.user_signin
);

router.post(
	'/api/v1/admin/forget'
	Helper.Auth.verify_origin,
	Helper.Validator.forget_password,
	Middleware.User.user_forget_password
);

router.post(
	'/api/v1/admin/reset'
	Helper.Auth.verify_origin,
	Helper.Validator.reset_password,
	Middleware.User.user_reset_password
);

router.post(
	'/api/v1/admin/update-profile',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Validator.user_profile,
	Middleware.User.user_update_profile
);

router.post(
	'/api/v1/admin/change-password',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Validator.change_password,
	Middleware.User.user_update_password
);

router.post(
	'/api/v1/admin/update-tfa',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Validator.verify_code,
	Middleware.User.user_update_tfa
);

module.exports = router;

