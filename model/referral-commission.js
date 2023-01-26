var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var schema = Schema({
	type:{
		type:String,
		default:'referral_commission'
	},
	stack_percentage: {
		type: Number,
		default: 0
	},
	borrow_percentage: {
		type: Number,
		default: 0
	},
	withdraw_percentage: {
		type: Number,
		default: 0
	}
})

module.exports = mongoose.model('MRADULEXG_REFCOMMISSION', schema, 'MRADULEXG_REFCOMMISSION')