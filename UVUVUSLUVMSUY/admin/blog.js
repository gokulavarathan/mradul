var express = require('express');

var Helper = {
	Auth:require('../../helper/auth'),
	Helper:require('../../helper/helper'),
	Validator:require('../../helper/validator')
};

var	Middleware = {
	Blog:require('../../UVSVklDRSFTElG/admin/blog'),
};

var router = express.Router();

router.get(
	'/api/v1/blog/list', 
	// Helper.Auth.verify_origin, 
	Middleware.Blog.list
)

router.get(
	'/api/v1/blog/category/:id',
	// Helper.Auth.verify_origin,
	Middleware.Blog.category_based_list
);

router.get(
	'/api/v1/blog/tag/:id',
	// Helper.Auth.verify_origin,
	Middleware.Blog.tag_based_list
);

router.get(
	'/api/v1/blog/related', 
	Helper.Auth.verify_origin, 
	Middleware.Blog.related_post
)

router.get(
	'/api/v1/blog/recent', 
	//Helper.Auth.verify_origin, 
	Middleware.Blog.recent_post
);

router.get(
	'/api/v1/blog/view/:id', 
	// Helper.Auth.verify_origin, 
	Middleware.Blog.view
)

router.post(
	'/api/v1/blog/update-comment', 
	Helper.Auth.verify_origin, 
	Middleware.Blog.update_comment
)

router.post(
	'/api/v1/blog/update-user-comment', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.update_user_comment
)

router.get(
	'/api/v1/blog/view-info/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.view_info
)

router.get(
	'/api/v1/blog/change/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.change_status
)

router.get(
	'/api/v1/blog/remove/:id', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.remove
)

router.get(
	'/api/v1/blog/remove-all', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.deleteAll
)

router.get(
	'/api/v1/blog/update-all/:status', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.blog_change_status_all
)

router.post(
	'/api/v1/blog/update', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isAdmin, 
	Helper.Auth.isauthenticated, 
	Middleware.Blog.update
)

router.get(
	'/api/v1/blog/category-list',
	// Helper.Auth.verify_origin,
	Middleware.Blog.blog_category
);

module.exports = router;