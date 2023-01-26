const mongoose = require('mongoose')

var borrowSchema = new mongoose.Schema({
	userId: { 
		type: Schema.Types.ObjectId 
	},
	borrow_currency: {
		type: String,
		required: true
	},
	collateral_currency: {
		type: String,
		required: true
	},
	borrow_amount: {
		type: Number,
		default: 0
	},
	collateral_amount: {
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
	completed_days: {
		type: Number,
		default: 0
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

module.exports = mongoose.model('MRADULEXG_BORROW', borrowSchema, 'MRADULEXG_BORROW');