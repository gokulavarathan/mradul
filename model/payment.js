const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    "paymentGateway":{
        type:String
    },
    "image":{
        type:String
    },
    "status":{
        type:Number,
        default:0
    },
    "dateTime":{
        type:Date,
        default:Date.now
    }
});

module.exports = paymentSchema;