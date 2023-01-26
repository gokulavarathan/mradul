var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

var Middleware = {
	Fiat:require('../../UVSVklDRSFTElG/fiat/history'),
	Deposit:require('../../UVSVklDRSFTElG/fiat/deposit')
}

router.get(
	'/api/v1/fiat/list/:module',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Fiat.list
);

router.get(
	'/api/v1/fiat/view/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Fiat.view
);

router.get(
	'/api/v1/fiat/approve-deposit/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Deposit.approve_deposit
);

router.get(
	'/api/v1/fiat/user-history', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Fiat.get_user_history
);

module.exports = router;