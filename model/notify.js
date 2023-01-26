var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notifySchema = new Schema({
	email:{
		type:String,
		required:true
	},
	category:{
		type:String,
		enum:['user','admin']
	},
	referenceId:{
		type:Schema.Types.ObjectId
	},
	tag:{
		type:String,
		default:''
	},
	message:{
		type:String,
		default:''
	},
	status:{
		type:Boolean,
		default:false
	},
	date:{
		type:Date,
	},
	udate:{
		type:Date,
		default:Date.now
	}
})

module.exports = mongoose.model('notification', notifySchema, 'notification')