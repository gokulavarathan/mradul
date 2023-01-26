var express = require('express'),
	router = express.Router();

var Helper = {
	Auth: require('../../helper/auth'),
	Helper: require('../../helper/helper'),
	Validator: require('../../helper/validator')
};

var Middleware = {
	faq: require('../../UVSVklDRSFTElG/admin/bullet_faq')
};

router.post(
	'/api/v1/user/faq-update-content',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.faq.faq
);
router.get(
	'/api/v1/faq-content-get',
	Helper.Auth.verify_origin,
	Middleware.faq.faq_list
);
router.get(
	'/api/v1/faq-content-list-get',
	Helper.Auth.verify_origin,
	Middleware.faq.faq_details
);
router.get(
	'/api/v1/remove-faq-get/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.faq.remove_faq
);
router.get(
	'/api/v1/faq-content-details/:id',
	Helper.Auth.verify_origin,
	Middleware.faq.faq_content_details
);


module.exports = router;

