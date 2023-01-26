var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = Schema({
	userId: {
		type: Schema.Types.ObjectId,
	},
	stackId: {
		type: Schema.Types.ObjectId,
	},
	history: [{
		plan: {
			type: String,
		},
		currency: {
			type: String,
		},
		day: {
			type: String,
		},
		amount: {
			type: Number,
		},
		daily_percentage: {
			type: Number,
		},
		status: {
			type: String,
			default: 'pending'
		},
		date: {
			type: Date,
			default: Date.now
		}
	}]
})

module.exports = mongoose.model('MRADULEXG_STACKHISTORY', schema, 'MRADULEXG_STACKHISTORY')