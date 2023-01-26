var express = require('express');
var router = express.Router();

var Middleware = {
	Fees:require('../../UVSVklDRSFTElG/admin/fees')
}

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

router.get('/api/v1/fee/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Fees.list
);

router.get(
	'/api/v1/fee/view/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Fees.view
);

router.get(
	'/api/v1/fee/show', 
	Helper.Auth.verify_origin, 
	Middleware.Fees.show
);

router.post(
	'/api/v1/fee/update', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Fees.update
);

module.exports = router;