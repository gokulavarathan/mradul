const mongoose = require('mongoose');
const OrdermappingSchema = new mongoose.Schema({
    "buyUserId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:'p2p_user'
    },
    "sellUserId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:'p2p_user'
    },
    "orderId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:'orderp2p'
    },
    "amount":{
        type:Number
    },
    "price":{
        type:Number
    },
    "total":{
        type:Number
    },
    "orderType":{
        type:String
    },
    "sellerConfirmation":{
        type:Boolean,
        default:false
    },
    "buyerConfirmation":{
        type:Boolean,
        default:false
    },
    "buyerDatetime":{
        type:Date
    },
    "sellerDatetime":{
        type:Date
    },
    "chats":{
        type:Array
    },
    "dispute":{
        type:Boolean,
        default:false
    },
    "disputeRaiser":{
        type:String,
        default:""
    },
    "proof":{
        type:String,
        default:""
    },
    "reason":{
        type:String,
        default:""
    },
    "favour":{
        type:String,
        default:""
    },
    "disputeDatetime":{
        type:Date
    },
    "datetime":{
        type:Date,
        default:Date.now
    }
})

module.exports = OrdermappingSchema;