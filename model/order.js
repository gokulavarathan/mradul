var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = Schema({
	pair: {
		type: String,
		default: ''
	},
	id: {
		type: String,
		default: ''
	},
	buyOrderId: {
		type: Schema.Types.ObjectId,
		ref: 'trade'
	},
	sellOrderId: {
		type: Schema.Types.ObjectId,
		ref: 'trade'
	},
	filled: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		default: 0
	},
	total: {
		type: Number,
		default: 0
	},
	buyer: {
		type: String,
		default: ''
	},
	seller: {
		type: String,
		default: ''
	},
	buyer_fee: {
		type: Number,
		default: 0
	},
	seller_fee: {
		type: Number,
		default: 0
	},
	buyer_deducted_percent: {
		type: Number,
		default: 0
	},
	seller_deducted_percent: {
		type: Number,
		default: 0
	},
	buyer_deducted_amount: {
		type: Number,
		default: 0
	},
	seller_deducted_amount: {
		type: Number,
		default: 0
	},
	buyer_total: {
		type: Number,
		default: 0
	},
	seller_total: {
		type: Number,
		default: 0
	},
	isBuyerMaker: {
		type: Boolean,
		default: true
	},
	status: {
		type: String,
		default: 'completed'
	},
	date: {
		type: Date,
		default: Date.now
	}
})

schema.index({ pair: 1, buyOrderId: 1, sellOrderId: 1 });
module.exports = mongoose.model('MRADULEXG_ORDMAPSTE', schema, 'MRADULEXG_ORDMAPSTE');