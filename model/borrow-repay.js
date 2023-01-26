const mongoose = require('mongoose')

var borrowSchema = new mongoose.Schema({
	userId: { 
		type: Schema.Types.ObjectId 
	},
	borrowId: {
        type: Schema.Types.ObjectId 
    },
	repay_currency: {
		type: String,
		required: true
	},
	repay_amount: {
		type: Number,
		default: 0
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		default: "completed"
	}
})

module.exports = mongoose.model('MRADULEXG_BRWREPAY', borrowSchema, 'MRADULEXG_BRWREPAY');