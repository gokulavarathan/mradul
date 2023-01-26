var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var cryptoSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	email: {
		type: String,
		default: ''
	},
	ipaddress: {
		type: String,
		default: ''
	},
	blockhash: {
		type: String,
		default: ''
	},
	hash: {
		type: String,
		default: ''
	},
	GasFee: {
		type: Number,
		default: 0
	},
	GasFeeCurrency: {
		type: String,
		default: ''
	},
	currency: {
		type: String,
		default: ''
	},
	sendaddress: {
		type: String,
		default: ''
	},
	receiveaddress: {
		type: String,
		required: true
	},
	senderTag: {
		type: String,
		default: ''
	},
	receiverTag: {
		type: String,
		default: ''
	},
	txnid: {
		type: String,
		default: ''
	},
	amount: {
		type: Number,
		default: 0
	},
	fee: {
		type: Number,
		default: 0
	},
	mainFee: {
		type: Number,
		default: 0
	},
	actualamount: {
		type: Number,
		default: 0
	},
	ordertype: {
		type: String,
		enum: ['send', 'receive'],
		default: ''
	},
	reason: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 2
	},
	date: {
		type: Date
	},
	udate: {
		type: Date,
		default: Date.now
	},
	explorer: {
		type: String,
		default: ''
	},
	movedAdmin: {
		type: Boolean,
		default: false
	},
})

cryptoSchema.index({ userId: 1 })
module.exports = mongoose.model('MRADULEXG_CRYPTRANUSE', cryptoSchema, 'MRADULEXG_CRYPTRANUSE')