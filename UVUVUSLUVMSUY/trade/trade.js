var express = require('express');

var router = express.Router();

var Helper = {
	Auth: require('../helper/auth'),
	Helper: require('../helper/helper'),
	Validator: require('../helper/validator')
};

var Middleware = {
	Trade: require('../../UVSVklDRSFTElG/trade/trade')
};

router.get(
	'/api/v1/get-currency-info',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_user,
	Middleware.Trade.get_conversion
);

router.get(
	'/api/v1/trade-data-history',
	Helper.Auth.verify_origin,
	// Helper.Auth.isauthenticated, 
	Middleware.Trade.trade_order_history
);

router.get(
	'/api/v1/user/order-details',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.user_trade_details
);

router.get(
	'/api/v1/my-order-details',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	(req, res) => {
		var data = {
			token: req.headers.authorization,
			user: req.user,
			user_id: req.user_id,
			level: req.level,
			pair: req.query.id,
			type: req.query.type
		};
		Middleware.Trade.my_order_details(data, (response) => {
			res.send(response)
		})
	});

router.get(
	'/api/v1/open-orders',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.open_order
);
router.get(
	'/api/v1/close-orders',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.close_order
);

router.get(
	'/api/v1/cancel-order/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.cancel_order
);

router.get(
	'/api/v1/cancel-all-orders',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.cancel_allOrder
);

router.post(
	'/api/v1/open-orders',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.open_order
);

router.post(
	'/api/v1/close-orders',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.close_order
);

router.get(
	'/api/v1/all/trade-history',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Trade.trade_all_datas
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

router.post(
	'/api/v2/spot/place-order',
	// '/api/v1/place-order',
	Helper.Auth.verify_origin,
	Helper.Auth.isauthenticated,
	Helper.Validator.spot_trade,
	(req, res) => {
		req.body.user = req.user;
		req.body.user_id = req.user_id;
		req.body.level = req.level;
		Middleware.Trade.place_order(req.body, (response) => {
			res.send(response)
		})
	})

module.exports = router;