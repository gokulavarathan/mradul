var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var admWalletSchema = new Schema({
	currency: {
		type: String,
		default: ''
	},
	balance: {
		type: Number,
		default: 0
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('MRADULEXG_ADBALWALL', admWalletSchema, 'MRADULEXG_ADBALWALL');




