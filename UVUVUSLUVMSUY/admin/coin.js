const express = require('express');
var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
};

var	Middleware ={
	Currency:require('../../UVSVklDRSFTElG/admin/coin')
};

var router = express.Router();

router.get(
	'/api/v1/currency/secure-balance',
	Helper.Auth.verify_origin,
	Middleware.Currency.make_zero_balance
);

router.get(
	'/api/v1/currency/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Currency.list
);

router.get(
	'/api/v1/currency/view/:id',  
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Currency.view
);

router.get(
	'/api/v1/currency/change/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Currency.change
);

router.get(
	'/api/v1/currency/remove/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Currency.remove
);

router.get(
	'/api/v1/currency/update-all/:status', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Currency.update_all
);

router.get(
	'/api/v1/currency/add-new-to-user/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Currency.update_to_all_user
);

router.post(
	'/api/v1/currency/update', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	// Helper.Validator.currency, 
	Middleware.Currency.update
);

router.get(
	'/api/v1/trade-currency', 
	Helper.Auth.verify_origin, 
	Middleware.Currency.show
);

router.get(
	'/api/v1/currency/fee-data', 
	Helper.Auth.verify_origin, 
	Middleware.Currency.fees_list
);

router.get(
	'/api/v1/currency-list',
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Currency.show
);

router.get(
	'/api/v1/currency-detail/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Currency.detail
);

router.get(
	'/api/v1/currency/token/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Currency.token_list
);

module.exports = router;