var express = require('express'),
	router = express.Router();

var Middleware = {
	Register: require('../../UVSVklDRSFTElG/user/register'),
	Login: require('../../UVSVklDRSFTElG/user/login'),
	Activation: require('../../UVSVklDRSFTElG/user/activate'),
	Profile: require('../../UVSVklDRSFTElG/user/profile'),
	History: require('../../UVSVklDRSFTElG/user/history'),
	Activity: require('../../UVSVklDRSFTElG/user/activity'),
	Security: require('../../UVSVklDRSFTElG/user/security'),

};

var Helper = {
	Auth: require('../../helper/auth'),
	Validator: require('../../helper/validator')
}

router.post(
	'/api/v1/register',
	Helper.Auth.verify_origin,
	Helper.Validator.register,
	Middleware.Register.user_signup
);

router.post(
	'/api/v1/resend-link',
	Helper.Auth.verify_origin,
	Middleware.Register.resend
);

router.post(
	'/api/v1/activate-account',
	Helper.Auth.verify_origin,
	Middleware.Activation.activate
);

router.post(
	'/api/v1/user/change-password',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	// Helper.Validator.change_password,
	Middleware.Security.user_update_password
);

router.post(
	'/api/v1/login',
	Helper.Auth.verify_origin,
	Helper.Validator.login,
	Middleware.Login.user_signin
);

router.post(
	'/api/v1/forget',
	Helper.Auth.verify_origin,
	Helper.Validator.forget_password,
	Middleware.Security.user_forget_password
);

router.post(
	'/api/v1/reset-password',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Helper.Validator.reset_password,
	Middleware.Security.user_reset_password
);

router.post(
	'/api/v1/password-reset-verification',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	//Helper.Validator.authentication,
	Middleware.Security.verify_confirmation_code
);

router.post(
	'/api/v1/user/update-profile',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	// Helper.Validator.user_profile,
	Middleware.Profile.user_update_profile
);

router.post(
	'/api/v1/user/update-kyc',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	// Helper.Validator.user_kyc,
	Middleware.Profile.user_update_kyc
);

router.post(
	'/api/v1/user/update-bank',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.user_update_bank
)

router.post(
	'/api/v1/user/update-tfa',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	//Helper.Validator.verify_code,
	Middleware.Security.user_update_tfa
);

router.post(
	'/api/v1/user/confirm-account',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	// Helper.Validator.authentication, 
	Middleware.Login.authentication
);

router.post('/api/v1/user/list',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.History.user_list
);

router.get(
	'/api/v1/user/get-active-user',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.History.active_user_list
);

router.post(
	'/api/v1/user/reject-kyc/:id/:page',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Security.reject_kyc
);

router.post(
	'/api/v1/user/approve-pancard',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Security.approve_pancard
);

router.post(
	'/api/v1/user/reject-pancard',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Security.reject_pancard
);

router.post(
	'/api/v1/user/fiat-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.fiat_history
);

router.post(
	'/api/v1/user/crypto-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.crypto_history
);

router.post(
	'/api/v1/user/open-order-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.open_orders
);

router.post(
	'/api/v1/user/trade-order-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.History.close_orders
);

router.post(
	'/api/v1/user/verify-otp',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Security.verify_otp_code
);

router.post(
	'/api/v1/user/verify-tfa',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Security.verify_tfa_code
);

router.post(
	'/api/v1/user/update-profile-image',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.update_profile_image
);

router.post(
	'/api/v1/user/signout-session',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Activity.terminate_session
);

router.post(
	'/api/v1/user/disable_auth',
	Helper.Auth.verify_origin,
	Helper.Validator.forget_password,
	Middleware.Security.disable_auth
);

router.post(
	'/api/v1/user/verify_auth_disable',
	Helper.Auth.verify_origin,
	Middleware.Security.verify_auth_disable
);

router.post(
	'/api/v1/user/save_support',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.save_support
);

router.post(
	'/api/v1/user/get_message',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.get_message
);

router.post(
	'/api/v1/user/new_message',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.new_message_user
);

router.post(
	'/api/v1/user/close-ticket',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.close_ticket
);

router.post(
	'/api/v1/user/new_message_admin',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.new_message_admin
);


router.post(
	'/api/v1/user/enable-crypto-transaction',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Helper.Validator.authentication,
	Helper.Validator.fund_passcode,
	Middleware.Profile.update_passcode
);
router.post(
	'/api/v1/user/send-sms',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Profile.update_mobile
);

router.post(
	'/api/v1/user/get-country-details',
	Helper.Auth.verify_origin,
	Middleware.Profile.get_country_details
);

router.post(
	'/api/v1/user/update-antiphising-code',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Profile.update_phising_code
);
router.post(
	'/api/v1/token/submit-form',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Helper.Auth.token_listing_form,
	Middleware.Profile.token_form
);
router.get(
	'/api/v1/token/token-listing',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Profile.token_listings
);



// router.post(
// 	'/api/v1/user/faq-update ',
// 	Helper.Auth.verify_origin, 
// 	Helper.Auth.isAdmin,
// 	Helper.Auth.isauthenticated, 
// 	Middleware.Profile.faq
// );


module.exports = router;