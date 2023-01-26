const mongoose = require('mongoose');

const stackSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref:'MRADULEXG_STEUSE',
	},
	plan: {
		type: String,
		default: ''
	},
	currency: {
		type: String,
		default: ''
	},
	amount: {
		type: Number,
		default: 0
	},
	return_percentage: {
		type: String,
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
	daily_rewards: {
		type: Number,
		default: 0
	},
	type: {
		type: String,
		default: 'stack'
	},
	status: {
		type: String,
		default: 'active'
	},
	remaining_days: {
		type: Number
	},
	completed_days: {
		type: Number,
		default: 0
	},
	total_rewards: {
		type: Number,
		default: 0
	},
    total_weeks: {
		type: Number,
		default: 0
	},
	start_date: {
		type: Date
	},
    end_date: {
		type: Date
	},
	created_date: {
		type: Date,
		default: Date.now
	}
})

// schema.index({ type: 1, ordertype: 1, status: 1 })
module.exports = mongoose.model('MRADULEXG_STACK', stackSchema, 'MRADULEXG_STACK')