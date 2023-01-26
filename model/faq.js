var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var faqSchema = new Schema({
	type:{
		type:String,
		enum:['faq', 'announcement']
	},
	mainCategory:{
		type:Schema.Types.ObjectId,
		reuired:true
	},
	subCategory:{
		type:String,
	},
	tags:{
		type:Array,
		default:[]
	},
	title:{
		type:String,
		required:true
	},
	content:{
		type:String,
		default:''
	},
	logo:{
		type:String,
		 default:''
		},
	status:{
		type:Boolean,
		default:true
	},
	date:{
		type:Date,
		default:Date.now
	},
	url:{
		type:String,
		required:true
	},
	author:{
		type:String,
		required:true
	},
	createdAt:{
		type:Date
	}
})

module.exports = mongoose.model('RkFRLUxpcQ', faqSchema, 'RkFRLUxpcQ');