var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var faqSchema = new Schema({
	category: {
		type: String,
		enum: ['faq', 'announcement', 'support', 'blog'],
		required: true
	},
	main_category: {
		type: String,
		required: true
	},
	id: {
		type: String,
		required: true
	},
	icon: {
		type: String,
		default: ''
	},
	sub_category: {
		type: Array,
		default: []
	},
	description: {
		type: String,
		default: ''
	},
	tags: {
		type: Array,
		default: []
	},
	date: {
		type: Date
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	}
})

module.exports = mongoose.model('MRADULEXG_STEFAQCAGRY', faqSchema, 'MRADULEXG_STEFAQCAGRY');