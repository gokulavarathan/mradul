const mongoose = require('mongoose')

var countrySchema = new mongoose.Schema({
	country: {
		type: String,
		required: true
	},
	symbol: {
		type: String,
		required: true
	},
	code: {
		type: String,
		default: ''
	},
	currency: {
		type: String,
		default: ''
	},
	date: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	}
})

module.exports = mongoose.model('MRADULEXG_COUNTRY', countrySchema, 'MRADULEXG_COUNTRY');