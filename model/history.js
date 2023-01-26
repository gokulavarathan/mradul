var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var historySchema = new Schema({
	category: { type: String, enum: ['user', 'admin', 'wallet'], required: true },
	userId: { type: Schema.Types.ObjectId },
	email: { type: String, required: true },
	browser: { type: String, default: '' },
	version: { type: String, default: '' },
	device: { type: String, default: '', default: 'pc' },
	method: { type: String, default: 'web' },
	os: { type: String, default: '' },
	location: { type: String, default: '' },
	ipaddress: { type: String, default: '' },
	date: { type: Date, default: Date.now },
	access_token: { type: String, default: '' },
	logout: { type: Date, default: Date.now },
	auth: { type: Boolean, default: false },
	status: { type: Boolean, default: true },
	latitude: { type: String, default: '' },
	longitude: { type: String, default: '' }
})

module.exports = mongoose.model('MRADULEXG_STEUSEHTRY', historySchema, 'MRADULEXG_STEUSEHTRY')