const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = Schema({
	category: {
		type: String,
	},
	reference: {
		type: Schema.Types.ObjectId,
	},
	profit: {
		type: Number,
		default: 0
	},
	currency: {
		type: String,
		default: ''
	},
	date: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('MRADULEXG_PROSTE', schema, 'MRADULEXG_PROSTE')