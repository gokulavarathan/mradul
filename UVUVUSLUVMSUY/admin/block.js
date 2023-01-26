var express = require('express');

var Helper = {
	Auth:require('../../helper/auth'),
	Helper:require('../../helper/helper'),
	Validator:require('../../helper/validator')
};

var	Middleware = {
	Block:require('../../UVSVklDRSFTElG/admin/block'),
	Home:require('../../UVSVklDRSFTElG/admin/home')
};

var router = express.Router();

router.get(
	'/api/v1/country-list', 
	Helper.Auth.verify_origin, 
	Middleware.Block.country_list
);

router.post(
	'/api/v1/ip-block', 
	Helper.Auth.verify_origin, 
	Middleware.Block.verify_ip_block
)

router.get(
	'/api/v1/ip-block/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Block.ip_list
)

router.get(
	'/api/v1/ip-block/change/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Block.block_change_status
)

router.get(
	'/api/v1/ip-block/remove/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Block.block_remove
)

router.get(
	'/api/v1/mail-block/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Block.email_list
)

router.post(
	'/api/v1/ip-block/update', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated, 
	Middleware.Block.block_update
)

router.post(
	'/api/v1/verify-ip',
	Helper.Auth.verify_origin,
	Middleware.Block.verify_ip
);

router.get(
	'/api/v1/country-block/list', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Block.country_list
)

router.get(
	'/api/v1/country-block/view/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Block.get_country_details
)

router.get(
	'/api/v1/country-block/change/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Block.block_country
)

router.get(
	'/api/v1/country-block/remove/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Block.remove_country,
)

router.post(
	'/api/v1/country-block/update', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Block.block_update
)

module.exports = router;