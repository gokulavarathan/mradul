const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var cryptoSchema = new Schema({
	userId: { type: Schema.Types.ObjectId },
	email: { type: String, required: true },
	ipaddress: { type: String, default: '' },
	txnid: { type: String },
	blockhash: { type: String },
	category: { type: String, enum: ['self', 'user'] },
	type: { type: String, enum: ['fiat', 'crypto'] },
	currency: { type: String, default: '' },
	sendaddress: { type: String },
	sendertag: { type: String, default: '' },
	receivertag: { type: String, default: '' },
	bank_info: { type: Object, default: {} },
	receiveaddress: { type: String },
	amount: { type: Number, default: 0 },
	fee: { type: Number, default: 0 },
	mainFee: { type: Number, default: 0 },
	GasFee: { type: Number, default: 0 },
	GasFeeCurrency: { type: String, default: '' },
	actualamount: { type: Number, default: 0 },
	confirmations: { type: Number, default: 0 },
	ordertype: { type: String, enum: ['withdraw', 'deposit'] },
	withdrawtype: { type: String, default: 'wallet', enum: ['wallet', 'profit'] },
	reason: { type: String, default: '' },
	description: { type: String, default: '' },
	status: { type: Number, default: 2 },
	date: { type: Date },
	udate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('MRADULEXG_STEADTRER', cryptoSchema, 'MRADULEXG_STEADTRER')