var express = require('express');

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
};

var Middleware = {
	Wallet:require('../../UVSVklDRSFTElG/admin/wallet')
};

var router = express.Router();

router.get(
	'/api/v1/wallet/wallet-balance/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Wallet.wallet_balance_info
);

router.get(
	'/api/v1/wallet/profit-info',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Wallet.profit_details_info
);

router.get(
	'/api/v1/wallet/cancel-transaction/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Wallet.cancel_transaction
);

router.get(
	'/api/v1/wallet/transaction-details/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Wallet.admin_transaction_details
);

router.post( 
	'/api/v1/wallet/transaction-history/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Wallet.admin_transaction_history
);

router.post(
	'/api/v1/wallet/admin-withdraw',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Validator.admin_wallet_withdraw,
	Middleware.Wallet.admin_withdraw
);

module.exports = router;