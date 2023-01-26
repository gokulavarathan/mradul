var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var assetListingSchema = new Schema({
    
	assets_full_name:{
        type:String,
        required:true
    },
    assets_ticker:{
        type:String,
        required:true
    },
    total_supply:{
       type:Number,
       required:true
    },
    date_of_issue:{
        type:String,
        required:true

    },
    official_website:{
        type:String,
        required:true
    },
    white_paper:{
        type:String,
        required:true
    },
    block_explorer:{
        type:String,
        required:true
    },
    source_code:{
        type:String,
        required:true
    },
    your_name:{
        type:String,
        required:true
    },
   your_role:{
       type:String,
       required:true
   },
   your_email:{
       type:String,
       required:true
   },
   your_mobile:{
       type:Number,
       required:true
   },
   Offering_price_currency:{
       type:String,
       required:true
   },
   Offering_price_amount:{
    type:Number,
    required:true
   },
   project_introduction:{
       type:String,
       required:true
   },
   project_community_network:{
       type:String
   },
   project_community_url:{
       type:String
   },
   asset_logo:{
        type:String
   },
   documents_upload:{
        type:String
   },
   createdAt:{
		type:Date
       
	},
   udate:{
		type:Date,
		default:Date.now
	}
})
module.exports = mongoose.model('ASSTLSTNG', assetListingSchema, 'ASSTLSTNG');