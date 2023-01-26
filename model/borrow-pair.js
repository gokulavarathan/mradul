const mongoose = require('mongoose')

var borrowPairSchema = new mongoose.Schema({
	borrow_currency: {
		type: String,
		required: true
	},
	collateral_currency: {
		type: String,
		required: true
	},
	borrow_value: {
		type: Number,
		required: true
	},
	collateral_value: {
		type: Number,
		required: true
	},
	min_amount: {
		type: Number,
		default: 0
	},
	max_amount: {
		type: Number,
		default: 0
	},
	borrow_fee: {
		type: Number,
		default: 0
	},
	daily_interest_rate: {
		type: Number,
		default: 0
	},
	hourly_interest_rate: {
		type: Number,
		default: 0
	},
	loan_term: {
		type: String,
	},
	repayment_days: {
		type: Number,
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	}
})

module.exports = mongoose.model('MRADULEXG_BORROWPAIR', borrowPairSchema, 'MRADULEXG_BORROWPAIR');