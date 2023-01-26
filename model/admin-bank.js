const mongoose = require('mongoose')

var adminBankSchema = new mongoose.Schema({
	bankname: {
		type: String,
		required: true,
	},
	branch: {
		type: String,
		required: true
	},
	currency: {
		type: String,
		required: true
	},
	acc_number: {
		type: Number,
		required: true,
		unique: true
	},
	account_type: {
		type: String,
		default: ''
	},
	ifsc_code: {
		type: String,
		required: true
	},
	holder: {
		type: String,
		required: true
	},
	country: {
		type: String,
		required: true
	},
	date: {
		type: Date,
	},
	udate: {
		type: Date,
		default: Date.now
	}
})

adminBankSchema.index({ currency: 1 })
module.exports = mongoose.model('MRADULEXG_STEFATADBNK', adminBankSchema, 'MRADULEXG_STEFATADBNK')