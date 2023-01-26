var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var supportSchema = new Schema({
    userId:{ type:Schema.Types.ObjectId, ref:'users' },
	Platform:{ type:Object },    
    issue_type:{ type:String, default:'' },
    query:{ type:String, default:'' },
	device:{ type:String },
	version:{ type:String, default:'' },
	website: { type:String, default:''},
    subject:{ type:String, default:'' },
    description:{ type:String, default:'' },
    file:{ type:String, default:'' },
    ticket_id:{ type:String, default:'' }, 
	category:{ type:String, default:'' }, 
	reply:{ type:String, default:'' },
	username:{ type:String, default:'' },
	email:{ type:String, default:'' },
	comments:{ type:String, default:'' },
    status:{ type:Boolean, default:false },
	date:{ type:Date, },
	udate:{ type:Date, default:Date.now }
})

module.exports = mongoose.model('support', supportSchema, 'support')