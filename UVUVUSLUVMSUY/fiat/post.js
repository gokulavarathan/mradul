var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

var Middleware = {
	Fiat:require('../../UVSVklDRSFTElG/fiat/history'),
	Deposit:require('../../UVSVklDRSFTElG/fiat/deposit'),
	Withdraw:require('../../UVSVklDRSFTElG/fiat/withdraw')
}

router.post(
	'/api/v1/fiat/cancel-deposit',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Deposit.cancel_deposit
);

router.post(
	'/api/v1/fiat/cancel-withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Withdraw.cancel_withdraw
);

router.post(
	'/api/v1/fiat/approve-withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Withdraw.approve_withdraw
);

router.post(
	'/api/v1/fiat/deposit',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Helper.Validator.fiat_deposit,
	Middleware.Deposit.place_deposit
);

router.post(
	'/api/v1/fiat/withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Helper.Validator.fiat_withdraw,
	Middleware.Withdraw.place_withdraw
);
router.post(
	'/api/v1/fiat/user-history', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Fiat.get_user_history
);
module.exports = router;