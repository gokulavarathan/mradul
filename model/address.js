const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let mySchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	currency: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	tag: {
		type: String,
		default: ''
	},
	secret: {
		type: String,
		default: ''
	},
	public: {
		typ: String,
		default: ''
	},
	date: {
		type: Date,
		default: Date.now
	}
})

mySchema.index({ userId: 1 });

module.exports = mongoose.model('MRADULEXG_CRYADDUSE', mySchema, 'MRADULEXG_CRYADDUSE');