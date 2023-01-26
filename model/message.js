var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var messagesSchema = new Schema({
	messageId:{
		type:String,
		required:true
    },
    name:{
    	type:String,
    },
    avatar:{
    	type:String,
    	default:''
    },
	email:{
		type:String,
    	default:''
	},
	comments:{
		type:String,
    	default:''
	},
    tag:{
		type:String,
		enum:['user', 'admin', 'subadmin']
    },
    message:{
		type:String,
		default:''
    },
    file:{
    	type:String,
    	default:''
    },
	date:{
		type:Date,
		default:Date.now
	}
})

module.exports = mongoose.model('messages', messagesSchema, 'messages')