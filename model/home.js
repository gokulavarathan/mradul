const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let mySchema = new Schema({
	category: {
		type: String,
		default: ''
	},
	title: {
		type: String,
		default: ''
	},
	main_content: {
		type: String,
		default: ''
	},
	sub_content: {
		type: String,
		default: ''
	},
	banner: {
		type: String,
		default: ''
	},
	date: {
		type: String,
	},
	udate: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('MRADULEXG_CMS', mySchema, 'MRADULEXG_CMS');