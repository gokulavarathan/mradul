var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = Schema({
	title: { type: String, required: true },
	subject: { type: String, default: '' },
	content: { type: String, default: '' },
	date: { type: Date },
	udate: { type: Date, default: Date.now },
	status: { type: Boolean, default: true }
})

schema.index({ title: 1 }, { unique: true })
module.exports = mongoose.model('MRADULEXG_STEEMATEMP', schema, 'MRADULEXG_STEEMATEMP')