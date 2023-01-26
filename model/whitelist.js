var mongoose = require('mongoose')

var blocklist = new mongoose.Schema({
	address:{
		type:String,
		required:true,
		unique:true
	},
	date:{
		type:Date,
	},
	udate:{
		type:Date,
		default:Date.now
	},
	status:{
		type:Boolean,
		default:true
	}
})

blocklist.index({address:1})
module.exports = mongoose.model('whitelist', blocklist, 'whitelist')