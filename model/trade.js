var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	pair: {
		type: String,
		default: ''
	},
	firstcurrency: {
		type: String,
		default: ''
	},
	secondcurrency: {
		type: String,
		default: ''
	},
	filled: {
		type: Number,
		default: 0
	},
	amount: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		default: 0
	},
	pending: {
		type: Number,
		default: 0
	},
	total: {
		type: Number,
		default: 0
	},
	type: {
		type: String,
		enum: ['buy', 'sell']
	},
	ordertype: {
		type: String,
		enum: ['limit', 'market', 'stop', 'trigger']
	},
	trigger_type: {
		type: String,
		enum: ['stop', 'trigger']
	},
	status: {
		type: String,
		enum: ['filled', 'cancelled', 'active', 'stoporder', 'partial', 'trigger']
	},
	level: {
		type: Number,
		default: 0
	},
	temp: {
		type: Number,
		default: 0
	},
	fee: {
		type: Number,
		default: 0
	},
	date: {
		type: Date
	},
	udate: {
		type: Date,
		default: Date.now
	}
})

schema.index({ type: 1, ordertype: 1, status: 1 })
module.exports = mongoose.model('MRADULEXG_TRASTEUSE', schema, 'MRADULEXG_TRASTEUSE')