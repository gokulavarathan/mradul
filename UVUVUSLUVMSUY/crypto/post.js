var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator'),
	Addr_Validator:require('../../helper/address_validator')
}

var Middleware = {
	Crypto:require('../../UVSVklDRSFTElG/crypto/history'),
	Deposit:require('../../UVSVklDRSFTElG/crypto/deposit'),
	Withdraw:require('../../UVSVklDRSFTElG/crypto/withdraw')
}

router.post(
	'/api/v1/crypto/cancel-withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Withdraw._cancel_withdraw
);

router.post(
	'/api/v1/crypto/approve-withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Withdraw._approve_withdraw
);

router.post(
	'/api/v1/crypto/withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Helper.Validator.crypto_withdraw,
	//Helper.Addr_Validator.validate_coin_address,
	Middleware.Withdraw._place_crypto
);
router.post(
	'/api/v1/crypto-history', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Crypto._crypto_history
);


module.exports = router;