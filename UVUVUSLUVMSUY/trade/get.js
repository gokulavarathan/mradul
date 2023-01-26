var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

var Middleware = {
	Trade:require('../../UVSVklDRSFTElG/trade/trade'),
	Cancel:require('../../UVSVklDRSFTElG/trade/cancel_order')
}

router.get(
	'/api/v1/get-currency-info', 
	Helper.Auth.verify_origin, 
	// Helper.Auth.verify_user, 
	Middleware.Trade.get_conversion
);

router.get(
	'/api/v1/all/trade-history',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Trade.trade_all_datas
);

router.get(
	'/api/v1/trade-data-history', 
	Helper.Auth.verify_origin, 
	Middleware.Trade.trade_order_history
);

router.get(
	'/api/v1/trade/view/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Trade.view_trade_details
);

router.get(
	'/api/v1/trade-history/view/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.view_trade_details
);

router.get(
	'/api/v1/order-history', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.order_history
);

router.get(
	'/api/v1/order-history/view/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.view_order_details
);

router.get(
	'/api/v1/cancel-order/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Cancel.cancel_order
);

router.get(
	'/api/v1/cancel-all-orders',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Middleware.Cancel.cancel_allOrder
);

router.get(
	'/api/v1/my-order-details', 
  	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.my_order_details
);

router.get(
	'/api/v1/user/wallet-balance', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.wallet_details_trade
);

router.get(
	'/api/v1/user/get-favourites', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.user_favourites
);

router.get(
	'/api/v1/user/move-to-favourites', 
	Helper.Auth.verify_origin, 
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated, 
	Middleware.Trade.add_favourites
);

module.exports = router;