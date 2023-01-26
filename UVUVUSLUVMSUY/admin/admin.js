const express = require('express');

var Middleware = {
	Admin: require('../../UVSVklDRSFTElG/admin/admin'),
	Profit: require('../../UVSVklDRSFTElG/admin/profit')
};

var Helper = {
	Auth: require('../../helper/auth'),
	Helper: require('../../helper/helper'),
	Validator: require('../../helper/validator'),
};
var router = express.Router();

router.get(
	'/api/v1/admin/top-pair',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.top_pairs
);

router.get(
	'/api/v1/admin/markets',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.markets
);

router.get(
	'/api/v1/admin/profile',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.view_profile
);

router.get(
	'/api/v1/admin/generate-tfa',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.generate_tfa
);

router.get(
	'/api/v1/admin/get-notifications',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.get_notifications
);

router.post(
	'/api/v1/admin/login',
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	//Helper.Validator.admin_login, 
	Middleware.Admin.login
);

router.post(
	'/api/v1/admin/auth',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.authentication
);

router.post(
	'/api/v1/admin/update-tfa',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.tfa
);

router.post(
	'/api/v1/admin/update-profile',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.update_profile
);

router.post(
	'/api/v1/admin/change',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.change_password
);

router.post(
	'/api/v1/admin/update-pattern',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.update_pattern
);

router.post(
	'/api/v1/admin/forget',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.forget_password
);

router.post(
	'/api/v1/admin/update-whitelist',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.update_whitelist
);

router.get(
	'/api/v1/admin/ip-list-data',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.ip_list
)

router.get(
	'/api/v1/admin/remove-whitelist/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.remove_whitelist
);

router.post(
	'/api/v1/ip-whitelist',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Middleware.Admin.white_list
);

router.post(
	'/api/v1/update-whitelist',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.update_white_list
)

router.get(
	'/api/v1/profit/:filter',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Profit.list
);

router.get(
	'/api/v1/total-profit',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Profit.profit_amount
);

router.get(
	'/api/v1/profit-details/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Middleware.Profit.profit_detail_data
);

router.get(
	'/api/v1/access-logs',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.logs_data
)

router.get(
	'/api/v1/admin/remove-notifications/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.remove_notifications
);

router.get(
	'/api/v1/admin/mark-all-notifications',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.mark_read
);

router.get(
	'/api/v1/store/get-response',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.generate_log_admin,
);

router.get(
	'/api/v1/fiat/bank-details',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.bank_details
);

router.get(
	'/api/v1/admin/banks/list',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.get_bank_list
);

router.get(
	'/api/v1/admin/banks/remove/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Helper.validate_objectid, 
	Middleware.Admin.remove_bank
)

router.post(
	'/api/v1/admin/update-bank',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.update_bank
);

router.post(
	'/api/v1/admin/fiat/deposit',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.fiat_deposit
);

router.post(
	'/api/v1/admin/fiat/withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.fiat_withdraw
);

router.post(
	'/api/v1/admin/crypto/withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.crypto_withdraw
);

router.post(
	'/api/v1/admin/user-orderhistory',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_orders
);

router.post(
	'/api/v1/admin/user-tradehistory',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_trades
);

router.post(
	'/api/v1/admin/user-fiat-assets',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_fiat_assets
);

router.post(
	'/api/v1/admin/user-crypto-assets',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_crypto_assets
);

router.post(
	'/api/v1/admin/user-tickets',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_tickets
);

router.post(
	'/api/v1/admin/user-transaction',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_transaction
);

router.post(
	'/api/v1/admin/user-activity',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.user_activity
);

router.post(
	'/api/v1/admin/user-notes',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.admin_note_users
);

router.post(
	'/api/v1/admin/disable-passcode',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.disable_passcode
);

router.post(
	'/api/v1/admin/add-note-user',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.add_note
);

router.post(
	'/api/v1/admin/update-user-bank',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Admin.update_user_bank
);

module.exports = router;