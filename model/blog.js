const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
	category: {
		type: String,
	},
	category_url: {
		type: String,
		default: ''
	},
	title: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	content: {
		type: String,
		default: ''
	},
	banner: {
		type: String,
		default: ''
	},
	status: {
		type: Boolean,
		default: true
	},
	date: {
		type: Date
	},
	udate: {
		type: Date,
		default: Date.now
	},
	url: {
		type: String,
		default: ''
	},
	meta_key: {
		type: String,
		default: ''
	},
	meta_title: {
		type: String,
		default: ''
	},
	meta_description: {
		type: String,
		default: ''
	},
	tag: {
		type: String,
		default: ''
	},
	tags: {
		type: Array,
		default: []
	},
	facebook: {
		type: String,
		default: ''
	},
	twitter: {
		type: String,
		default: ''
	},
	linkedin: {
		type: String,
		default: ''
	},
	google_plus: {
		type: String,
		default: ''
	},
	pinterest: {
		type: String,
		default: ''
	},
	tags: {
		type: Array,
		default: []
	},
	reviews: {
		type: [Object],
		default: []
	}
})

blogSchema.index({ url: 1 })
module.exports = mongoose.model('MRADULEXG_BLOG', blogSchema, 'MRADULEXG_BLOG');