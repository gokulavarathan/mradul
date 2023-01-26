var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var walletSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref:'MRADULEXG_STEUSE',
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

module.exports = mongoose.model('p2pwallet', walletSchema, 'MRADULEXG_P2PUSEWALL')