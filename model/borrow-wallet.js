var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var borrowWalletSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		unique: true,
		required: true
	},
	wallet: [{
		currency: {
			type: String,
			default: ''
		},
		amount: {
			type: Number,
			default: 0
		},
		hold: {
			type: Number,
			default: 0
		}
	}]
});

module.exports = mongoose.model('borrowWallet', borrowWalletSchema, 'MRADULEXG_BORWUSEWALL')