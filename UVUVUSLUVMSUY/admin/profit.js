const express = require('express');
var router = express.Router();

var Helper = {
	Auth:require('../../helper/auth')
};

var Middleware = {
	Profit:require('../../UVSVklDRSFTElG/admin/profit')
}

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

module.exports = router;