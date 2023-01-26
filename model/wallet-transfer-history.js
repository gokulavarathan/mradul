const mongoose = require('mongoose');
const walletTransferHistory = new mongoose.Schema({
    "fromWallet":{
        type:String,
        default:""
    },
    "toWallet":{
        type:String,
        default:""
    },
    "amount":{
        type:Number,
        default:0
    },
    "fee":{
        type:Number,
        default:0
    },
    "feePercent":{
        type:Number,
        default:0
    },
    "receiveAmount":{
        type:Number,
        default:0
    },
    "userId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MRADULEXG_STEUSE'
    },
    "currencyId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MRADULEXG_CURRDETSTE'
    },
    "currencySymbol":{
        type:String,
        default:""
    },
    "dateTime":{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('walletTransfer', walletTransferHistory, 'MRADULEXG_WALTRANS')