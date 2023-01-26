var express = require('express'),
	router = express.Router();

var Helper = {
	Auth: require('../../helper/auth'),
	Validator: require('../../helper/validator')
}

var Middleware = {
	Trade: require('../../UVSVklDRSFTElG/trade/trade')
}
router.post(
	'/api/v1/place-order',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isauthenticated,
	Helper.Validator.spot_trade,
	Middleware.Trade.place_order
);

module.exports = router;