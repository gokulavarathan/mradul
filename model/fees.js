const mongoose = require('mongoose');

var feeStructure = new mongoose.Schema({
	type: {
		type: String,
		enum: ['normal', 'vip']
	},
	user: {
		type: String,
		enum: ['individual', 'corporate']
	},
	level: {
		type: Number,
		default: 1
	},
	condition: {
		type: String,
		default: ''
	},
	makerfee: {
		type: Number,
		default: 0
	},
	takerfee: {
		type: Number,
		default: 0
	},
	trade_volume: {
		type: Number,
		default: 0
	},
	noc_balance: {
		type: Number,
		default: 0
	},
	block_deposit: {
		type: Boolean,
		default: false
	},
	block_withdraw: {
		type: Boolean,
		default: false
	},
	date: {
		type: Date,
	},
	udate: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	}
})

feeStructure.index({ level: 1 })
module.exports = mongoose.model('MRADULEXG_TREFEE', feeStructure, 'MRADULEXG_TREFEE')