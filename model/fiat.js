const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var fiatSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	email: {
		type: String,
		default: ""
	},
	currency: {
		type: String,
		default: ''
	},
	amount: {
		type: Number,
		default: 0
	},
	actualamount: {
		type: Number,
		default: 0
	},
	proof: {
		type: String,
		default: ''
	},
	fee: {
		type: Number,
		default: 0
	},
	mainFee: {
		type: Number,
		default: 0
	},
	bank: {
		type: Object,
		default: {}
	},
	gateway: {
		type: String,
		default: ''
	},
	paymentMethod: {
		type: String,
		default: 'instantpay'
	},
	orderId: {
		type: String,
		default: ''
	},
	paymentId: {
		type: String,
		default: ''
	},
	category: {
		type: String,
		enum: ['deposit', 'withdraw']
	},
	comment: {
		type: String,
		default: ''
	},
	reason: {
		type: String,
		default: ''
	},
	remarks: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 2
	},
	gst: {
		type: Number,
		default: 0
	},
	date: {
		type: Date
	},
	udate: {
		type: Date,
		default: Date.now
	},
	paymentType: {
		type: String,
		enum: ['online', 'offline'],
		default: 'online'
	}
})

module.exports = mongoose.model('MRADULEXG_FIATRANUSE', fiatSchema, 'MRADULEXG_FIATRANUSE');