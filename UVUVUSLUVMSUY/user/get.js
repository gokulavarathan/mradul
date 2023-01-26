	var express = require('express'),
	router = express.Router();

var Middleware = {
	History:require('../../UVSVklDRSFTElG/user/history'),
	Activity:require('../../UVSVklDRSFTElG/user/activity'),
	Profile:require('../../UVSVklDRSFTElG/user/profile'),
	Security:require('../../UVSVklDRSFTElG/user/security')
};

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}


router.get(
	'/api/v1/user/profile',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.user_profile
);

router.get(
	'/api/v1/fiat/assets',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.user_fiat_assets
);

router.get(
	'/api/v1/crypto/assets',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.user_crypto_assets
);

router.get(
	'/api/v1/user/log-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Activity.log_history
);

router.get(
	'/api/v1/user/session-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Activity.session_history
);

router.get(
	'/api/v1/user/fiat-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.fiat_history
);

router.get(
	'/api/v1/user/send-otp',
 	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Security.send_otp
);

router.get(
	'/api/v1/user/crypto-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.crypto_history
);

router.get(
	'/api/v1/user/open-order-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.open_orders
);

router.get(
	'/api/v1/user/trade-order-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.close_orders
);

router.get('/api/v1/user/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.History.user_list
);

router.get('/api/v1/user/view/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.History.user_details
);

router.get(
	'/api/v1/user/change/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Security.change
);

router.get(
	'/api/v1/get-crypto-address/:coin',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.get_crypto_address
);

router.get(
	'/api/v1/user/disable-tfa/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Security.disable
);

router.get(
	'/api/v1/user/approve-kyc/:id/:page', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Security.approve_kyc
);

router.get(
	'/api/v1/user/fee-details',
 	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Profile.fee_details
);

router.get(
	'/api/v1/user/trade-volume',
 	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.trade_volume
);

router.get(
	'/api/v1/user/currency-balance/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.Profile.wallet_balance_amount
);

router.get(
	'/api/v1/user/total-balance', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.Profile.wallet_details_conversion
);

router.get(
	'/api/v1/user/tickets', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.History.get_tickets
);

router.get(
	'/api/v1/user/sign-out',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Activity.sign_out
);

router.get(
	'/api/v1/user/remove-bank',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Profile.remove_bank
);

router.get(
	'/api/v1/user/notification', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Profile.get_my_notification
);
router.get(
	'/api/v1/user/disable-notification/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Profile.remove_notification
);
module.exports = router;