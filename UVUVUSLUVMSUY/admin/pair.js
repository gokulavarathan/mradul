const express = require('express');
var Helper = { 
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
};

var	Middleware = {
	Pair:require('../../UVSVklDRSFTElG/admin/pair')
};

let router = express.Router();

router.get(
	'/api/v1/pair/list',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Pair.list
);

router.get(
	'/api/v1/pair/view/:id',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Pair.view
);

router.get(
	'/api/v1/pair/change/:id',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Auth.verify_permission, 
	Middleware.Pair.change
);

router.get(
	'/api/v1/pair/remove/:id',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Auth.verify_permission, 
	Middleware.Pair.remove
);

router.post(
	'/api/v1/pair/update',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Validator.pair,
	// Helper.Auth.verify_permission, 
	Middleware.Pair.update
);

router.get(
	'/api/v1/pair/update-all/:status',
  	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	// Helper.Auth.verify_permission, 
	Middleware.Pair.update_all
);

router.get(
	'/api/v1/pair-list',
  	Helper.Auth.verify_origin,
	Middleware.Pair.show
);

router.get(
	'/api/v1/pair-detail/:id',
  	// Helper.Auth.verify_origin,
	Middleware.Pair.detail
);

router.get(
	'/api/v1/pair-currencies',
  	Helper.Auth.verify_origin,
	Middleware.Pair.pair_currency
);

router.get(
	'/api/v1/top-pair',
  	Helper.Auth.verify_origin,
	Middleware.Pair.top_pair
);

module.exports = router;