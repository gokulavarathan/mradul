var mongoose = require('mongoose')

var blocklist = new mongoose.Schema({
	category: {
		type: String,
		enum: ['ip', 'email'],
		required: true
	},
	name: {
		type: String,
		required: true,
		unique: true
	},
	date: {
		type: Date,
	},
	udate: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	}
})

blocklist.index({ name: 1 })
module.exports = mongoose.model('MRADULEXG_BLKLIST', blocklist, 'MRADULEXG_BLKLIST')