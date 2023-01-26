const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const Stackplanchema = Schema({
	plan: {
		type: String,
		default: ''
	},
	currency: {
		type: String,
		default: ''
	},
	min_amount: {
		type: Number,
		default: 0
	},
	max_amount: {
		type: Number,
		default: 0
	},
	return_percentage: {
		type: Number,
		default: 0
	},
	weekly_percentage: {
		type: Number,
		default: 0
	},
    daily_percentage: {
		type: Number,
		default: 0
	},
	fee: {
		type: Number,
		default: 0
	},
    total_weeks: {
		type: Number,
		default: 0
	},
	created_date: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('MRADULEXG_STACKPLAN', Stackplanchema, 'MRADULEXG_STACKPLAN')