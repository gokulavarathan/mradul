var express = require('express');

var Helper = {
	Auth:require('../../helper/auth'),
	Helper:require('../../helper/helper'),
	Validator:require('../../helper/validator')
};

var	Middleware = {
	FAQ:require('../../UVSVklDRSFTElG/admin/faq')
};

var router = express.Router();

router.get(
	'/api/v1/support', 
	Helper.Auth.verify_origin, 
	Middleware.FAQ.faq_category
);

router.get(
	'/api/v1/support-category-list', 
	Helper.Auth.verify_origin, 
	Middleware.FAQ.support_category_list
); 

router.get(
	'/api/v1/announcements',
	Helper.Auth.verify_origin, 
	Middleware.FAQ.announcement_list
);

router.get(
	'/api/v1/support/details/:id',
	Helper.Auth.verify_origin,  
	Middleware.FAQ.support_details
)

router.get(
	'/api/v1/faq-category/list', 
	Helper.Auth.verify_origin, 
	Middleware.FAQ.faq_category_list
);

router.get(
	'/api/v1/faq-content',
	Helper.Auth.verify_origin,  
	Middleware.FAQ.faq_list
)

router.get(
	'/api/v1/faq-content-list', 
	Helper.Auth.verify_origin, 
	Middleware.FAQ.faq_details
)

router.get(
	'/api/v1/faq-content-details/:id',
	Helper.Auth.verify_origin,  
	Middleware.FAQ.faq_content_details
)

router.get(
	'/api/v1/update-faq-status/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.FAQ.update_faq_status
)

router.get(
	'/api/v1/remove-faq/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.FAQ.remove_faq
)

router.get(
	'/api/v1/remove-faq-category/:id',
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.FAQ.remove_faq_category
)

router.post(
	'/api/v1/update-faq-category', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.FAQ.update_category
)

router.post(
	'/api/v1/update-faq', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.FAQ.update_faq_content
)

module.exports = router;