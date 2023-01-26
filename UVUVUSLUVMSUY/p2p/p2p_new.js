const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const async = require('async');
const uniqid = require('uniqid');

const common = require('../../helper/db2');
const auth = require('../../helper/auth');
const encrypter = require('../../helper/encrypter');
const socket_config = require('../../helper/config');

const currencyDB = require('../../model/currency');
const userDB = require('../../model/user');
const userwalletDB = require('../../model/p2p-wallet');
const siteDB = require('../../model/site');

const p2puserDB = common.getSecondaryDB().model('p2p_user');
const p2porderDB = common.getSecondaryDB().model('orderp2p');
const p2pmappingDB = common.getSecondaryDB().model('ordermapping');
const payment = common.getSecondaryDB().model('payment');
const p2pcurrencyDB = common.getSecondaryDB().model('p2p_currency');
const p2pnotiDB = common.getSecondaryDB().model('p2p_notify');

//get coin list
router.get('/api/v1/user/p2p/getCoins', (req, res)=>{
    try{
        async.parallel({
            "fiatList":function(cb){
                currencyDB.find({"type":"fiat", "status":true}, {"_id":1, "currency":1, "symbol":1, "type":1, "cointype":1, "logo":1, "status":1, "marketPrice":1}, (err, getlist)=>{
                    cb(null, getlist)
                })
            },
            "cryptoList":function(cb){
                currencyDB.find({"type":"crypto", "status":true}, {"_id":1, "currency":1, "symbol":1, "type":1, "cointype":1, "logo":1, "status":1, "marketPrice":1}, (err, getlist)=>{
                    cb(null, getlist)
                })
            },
            "allList":function(cb){
                currencyDB.find({"status":true}, {"_id":1, "currency":1, "symbol":1, "type":1, "cointype":1, "logo":1, "status":1, "marketPrice":1}, (err, getlist)=>{
                    cb(null, getlist)
                })
            },
            "paymentCurrency":function(cb){
                p2pcurrencyDB.find({"status":true}, (err, getlist)=>{
                    cb(null, getlist)
                })
            }
        }, (err, result)=>{
            if(!err){
                res.json({"status":true, "message":"success", "data":result})
            }else{
                let data = {
                    "fiatList":[],
                    "cryptoList":[],
                    "allList":[]
                }
                res.json({"status":true, "message":"success", "data":data})
            }
        })
    }catch(err){
        console.log("Error catched in get coins", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//get payment methods
router.get('/api/v1/user/p2p/paymentGet', (req, res)=>{
    try{
        payment.find({"status":1}, (err, getlist)=>{
            if(!err && getlist.length > 0){
                res.json({"status":true, "message":"success", "data":getlist})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in get payment", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//post advertisement
router.post('/api/v1/user/p2p/postAdvertisement', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        let userId = mongoose.Types.ObjectId(req.user_id);
        data.userId = userId;
        data.availableAmount = data.amount;
        if(data._id == undefined && typeof data._id == 'undefined'){
            userDB.findOne({"_id":userId}, (err, getuser)=>{
                if(!err && getuser != null){
                    if(data.amount > 0){
                        if(data.minAmount < data.amount && data.minAmount > 0){
                            Balancecheck(userId, data, (balresult)=>{
                                if(balresult){
                                    data.orderid = uniqid.time(userId);
                                    p2porderDB.create(data, (err, created)=>{
                                        if(!err && created){
                                            res.json({"status":true, "message":"Post Advertisement created successfully"})
                                        }else{
                                            res.json({"status":false, "message":"Error occurred in order creation. Please try again later"})
                                        }
                                    })
                                }else{
                                    res.json({"status":false, "message":"Insufficient balance"})
                                }
                            })    
                        }else{
                            res.json({"status":false, "message":"Invalid minimum amount"})
                        }
                    }else{
                        res.json({"status":false, "message":"Invalid amount"})
                    }              
                }else{
                    res.json({"status":false, "message":"Unauthorized person"})
                }
            })
        }else{
            p2porderDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getorder)=>{
                if(!err && getorder != null){
                    if(getorder.orderType == data.orderType){
                        Balancecheck(userId, data, (balresult)=>{
                            if(balresult){
                                // data.orderid = uniqid.time(userId);
                                p2porderDB.create(data, (err, created)=>{
                                    if(!err && created){
                                        res.json({"status":true, "message":"Post Advertisement created successfully"})
                                    }else{
                                        res.json({"status":false, "message":"Error occurred in order creation. Please try again later"})
                                    }
                                })
                            }else{
                                res.json({"status":false, "message":"Insufficient balance"})
                            }
                        })
                    }else{
                        res.json({"status":false, "message":"You cannot able to change ordertype"})
                    }
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }
    }catch(err){
        console.log("Error catched in post advertisement", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

function Balancecheck(userId, data, callback){
    if(data.orderType == "buy"){
        callback(true);
    }else{
        userwalletDB.findOne({"userId":userId, "wallet.currency":data.firstCurrency.toLowerCase()}, {"wallet.$":1}, (err, getbal)=>{
            if(!err && getbal){
                if(getbal.wallet[0].amount >= data.amount){
                    callback(true);
                }else{
                    callback(false);
                }
            }else{
                callback(false);
            }
        })
    }
}

//get my advertisement
router.get('/api/v1/user/p2p/getAdvertisement', auth.isauthenticated, (req, res)=>{
    try{
        let userId = mongoose.Types.ObjectId(req.user_id);
        p2porderDB.find({"$and":[{"userId":userId}, {"$or":[{"status":0}, {"status":2}]}]}, (err, getlist)=>{
            if(!err && getlist.length > 0){
                res.json({"status":true, "message":"success", "data":getlist})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in get advertisement", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//get balance of seller
router.post('/api/v1/user/p2p/sellerBalance', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        if(data._id != undefined && typeof data._id != 'undefined'){
            p2porderDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getorder)=>{
                if(!err && getorder != null){
                    let userId = getorder.userId;
                    userwalletDB.findOne({"userId":userId, "wallet.currency":getorder.firstCurrency.toLowerCase()}, {"wallet.$":1}, (err, getbal)=>{
                        if(!err && getbal){
                            if(getbal){
                                res.json({"status":true, "message":"success", "balance":getbal.wallet[0].amount})
                            }else{
                                res.json({"status":true, "message":"success", "balance":0})
                            }
                        }else{
                            res.json({"status":false, "message":"Error occurred in get seller balance. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }else{
            res.json({"status":false, "message":"Id is required"})
        }
    }catch(err){
        console.log("Error catched in seller balance", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//get my orders
router.post('/api/v1/user/p2p/myOrders', auth.isauthenticated, (req, res)=>{
    try{
        let userid = mongoose.Types.ObjectId(req.user_id);
        let data = req.body; //status
        if(data.status != undefined && typeof data.status != 'undefined'){
            let cnt = [{"user":userid}]
            if(data.status == "Pending"){
                cnt.push({"status":"Pending"})
            }else if(data.status == "Completed"){
                cnt.push({"status":"Completed"})
            }else if(data.status == "Cancelled"){
                cnt.push({"status":"Cancelled"})
            }
            p2porderDB.aggregate([
                {
                    "$lookup":{
                        "from":"MRADULEXG_PTPUSER",
                        "localField":"userId",
                        "foreignField":"_id",
                        "as":"userdata"
                    }
                },
                {
                    "$project":{
                        "userId":1,
                        "orderType":1,
                        "firstCurrency":1,
                        "secondCurrency":1,
                        "location":1,
                        "marketPrice":1,
                        "marginPercentage":1,
                        "price":1,
                        "amount":1,
                        "minAmount":1,
                        "maxAmount":1,
                        "availableAmount":1,
                        "paymentMethod":1,
                        "paymentDetails":1,
                        "remarks":1,
                        "isKycNeed":1,                        
                        "dateTime":1,
                        "orderid":1,
                        "user":{"$arrayElemAt":["$userdata._id", 0]},
                        "email":{"$arrayElemAt":["$userdata.email", 0]},
                        "username":{"$arrayElemAt":["$userdata.username", 0]},
                        "bank_info":{"$arrayElemAt":["$userdata.bank_info", 0]},
                        "bank_status":{"$arrayElemAt":["$userdata.bank_status", 0]},
                        "payment":{"$arrayElemAt":["$userdata.payment", 0]},
                        "status":{
                            "$cond":{
                                "if":{"$eq":["$status", 0]}, then: "Pending", else:{
                                    "$cond":{
                                        "if":{"$eq":["$status", 2]}, then:"Pending", else:{
                                            "$cond":{
                                                "if":{"$eq":["$status", 3]}, then:"Cancelled", else:"Completed"
                                            }
                                        }
                                    } 
                                }
                            }
                        }
                    }
                },
                {
                    "$match":{
                        "$and":cnt
                    }
                },
                {
                    "$sort":{
                        "dateTime":-1
                    }
                }
            ], (err, result)=>{
                if(!err && result.length > 0){
                    let count = 0;
                    for(let i=0; i<result.length; i++){
                        result[i].email = encrypter.decrypt_data(result[i].email);
                        count++;
                        if(count == result.length){
                            res.json({"status":true, "message":"success", "data":result})
                        }
                    }
                }else{
                    res.json({"status":true, "message":"success", "data":[]})
                }
            })  
        }else{
            res.json({"status":false, "message":"Status is required"})
        }
    }catch(err){
        console.log("Error catched in get orders", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//get orders
router.post('/api/v1/user/p2p/getOrders', (req, res)=>{
    try{
        let data = req.body; //orderType
        if(data.orderType != undefined && typeof data.orderType != 'undefined'){
            if(data.orderType == "buy" || data.orderType == "sell"){
                p2porderDB.aggregate([
                    {
                        "$lookup":{
                            "from":"MRADULEXG_PTPUSER",
                            "localField":"userId",
                            "foreignField":"_id",
                            "as":"userdata"
                        }
                    },
                    {
                        "$project":{
                            "userId":1,
                            "orderType":1,
                            "firstCurrency":1,
                            "secondCurrency":1,
                            "location":1,
                            "marketPrice":1,
                            "marginPercentage":1,
                            "price":1,
                            "amount":1,
                            "minAmount":1,
                            "maxAmount":1,
                            "availableAmount":1,
                            "paymentMethod":1,
                            "paymentDetails":1,
                            "remarks":1,
                            "isKycNeed":1,                        
                            "dateTime":1,
                            "orderid":1,
                            "user":{"$arrayElemAt":["$userdata._id", 0]},
                            "email":{"$arrayElemAt":["$userdata.email", 0]},
                            "username":{"$arrayElemAt":["$userdata.username", 0]},
                            "bank_info":{"$arrayElemAt":["$userdata.bank_info", 0]},
                            "bank_status":{"$arrayElemAt":["$userdata.bank_status", 0]},
                            "payment":{"$arrayElemAt":["$userdata.payment", 0]},
                            "status":{
                                "$cond":{
                                    "if":{"$eq":["$status", 0]}, then: "Pending", else:{
                                       "$cond":{
                                            "if":{"$eq":["$status", 2]}, then:"Pending", else:{
                                                "$cond":{
                                                    "if":{"$eq":["$status", 3]}, then:"Cancelled", else:"Completed"
                                                }
                                            }
                                       } 
                                    }
                                }
                            }
                        }
                    },
                    {
                        "$match":{
                            "orderType":data.orderType,
                            "status":"Pending",
                            "availableAmount":{"$ne":0}
                        }
                    },
                   {
                       "$sort":{
                           "dateTime":-1
                       }
                   }
                ], (err, result)=>{
                    console.log("Result", result)
                    if(!err && result.length > 0){
                        let count = 0;
                        for(let i=0; i<result.length; i++){
                            result[i].email = encrypter.decrypt_data(result[i].email);
                            count++;
                            if(count == result.length){
                                res.json({"status":true, "message":"success", "data":result})
                            }
                        }
                    }else{
                        res.json({"status":true, "message":"success", "data":[]})
                    }
                })
            }else{
                res.json({"status":false, "message":"Invalid ordertype"})
            }
        }else{
            res.json({"status":false, "message":"Ordertype is required"})
        }
    }catch(err){
        console.log("Error catched in get orders", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//mapping code
router.post('/api/v1/user/p2p/orderCreate', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body; //_id, amount, orderType
        let userId = mongoose.Types.ObjectId(req.user_id);
        userDB.findOne({"_id":userId}, (err, getuser)=>{
            if(!err && getuser != null){
                if(data._id != undefined && typeof data._id != 'undefined' && data.amount != undefined && typeof data.amount != 'undefined' && data.orderType != undefined && typeof data.orderType != 'undefined'){
                    p2porderDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getorder)=>{
                        if(!err && getorder != null){
                            if(getorder.status == 0 || getorder.status == 2){
                                if(getorder.availableAmount != 0){
                                    if(getorder.userId.toString() != userId.toString()){
                                        let kycverified;
                                        if(getorder.isKycNeed == true){
                                            if(getuser.kycVerified == true){
                                                kycverified = true;
                                            }else{
                                                kycverified = false;
                                            }
                                        }else{
                                            kycverified = true;
                                        }
                                        if(kycverified){
                                            if(data.amount >= getorder.minAmount){
                                                if(data.amount <= getorder.maxAmount){
                                                    let obj = {};
                                                    if(data.orderType == "buy"){
                                                        obj = {
                                                            "buyUserId":userId,
                                                            "sellUserId":getorder.userId,
                                                            "orderId":getorder._id,
                                                            "amount":data.amount,
                                                            "price":getorder.price,
                                                            "total":data.amount * getorder.price,
                                                            "orderType":"buy"
                                                        }
                                                    }else{
                                                        obj = {
                                                            "sellUserId":userId,
                                                            "buyUserId":getorder.userId,
                                                            "orderId":getorder._id,
                                                            "amount":data.amount,
                                                            "price":getorder.price,
                                                            "total":data.amount * getorder.price,
                                                            "orderType":"sell"
                                                        }
                                                    }
                                                    p2pmappingDB.create(obj, (err, mapcreated)=>{
                                                        if(!err && mapcreated){
                                                            // let availamt = getorder.availableAmount - data.amount;
                                                            p2porderDB.updateOne({"_id":mongoose.Types.ObjectId(getorder._id)}, {"$set":{"status":2}}, (err, updated)=>{
                                                            // p2porderDB.updateOne({"_id":mongoose.Types.ObjectId(getorder._id)}, {"$set":{"availableAmount":availamt, "status":2}}, (err, updated)=>{
                                                                if(!err && updated){
                                                                    orderEmit(mapcreated._id);
                                                                    let buynotify = {
                                                                        "userId":obj.buyUserId,
                                                                        "message":"Order matched successfully. Waiting for your payment and confirmation",
                                                                        "referenceId":mapcreated._id,
                                                                        "avatar":getuser.avatar,
                                                                        "keyValue":"p2p"
                                                                    }
                                                                    p2pnotiDB.create(buynotify, (err, buynoti)=>{
                                                                        socket_config.sendmessage("getNotify", buynoti)
                                                                        let sellnotify = {
                                                                            "userId":obj.sellUserId,
                                                                            "message":"Order matched successfully. Waiting for buyer confirmation",
                                                                            "referenceId":mapcreated._id,
                                                                            "avatar":getuser.avatar,
                                                                            "keyValue":"p2p"
                                                                        }
                                                                        p2pnotiDB.create(sellnotify, (err, sellnoti)=>{
                                                                            userwalletDB.findOne({"userId":mongoose.Types.ObjectId(mapcreated.sellUserId), "wallet.currency":getorder.firstCurrency.toLowerCase()}, {"wallet.$":1}, (err, getbalance)=>{
                                                                                if(!err && getbalance){
                                                                                    if(getbalance.wallet[0].amount >= data.amount){
                                                                                        let newbal = getbalance.wallet[0].amount - data.amount;
                                                                                        userwalletDB.updateOne({"userId":mongoose.Types.ObjectId(mapcreated.sellUserId), "wallet.currency":getorder.firstCurrency.toLowerCase()}, {"$set":{"wallet.$.amount":newbal}}, (err, updated)=>{
                                                                                            socket_config.sendmessage("getNotify", sellnoti)
                                                                                            res.json({"status":true, "message":"Order matched successfully", "data":mapcreated._id})
                                                                                        })
                                                                                    }else{
                                                                                        res.json({"status":false, "message":"Seller doesn't have sufficient balance"})
                                                                                    }
                                                                                }else{
                                                                                    res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                                                                                }
                                                                            })
                                                                           
                                                                        })
                                                                    })
                                                                }else{
                                                                    res.json({"status":false, "message":"Error in mapping. Please try again later"})
                                                                }
                                                            })
                                                        }else{
                                                            res.json({"status":false, "message":"Error occurred in mapping. Please try again later"})
                                                        }
                                                    })
                                                }else{
                                                    res.json({"status":false, "message":`Amount should be less than or equal to ${getorder.maxAmount}`})
                                                }
                                            }else{
                                                res.json({"status":false, "message":`Amount should be greater than or equal to ${getorder.minAmount}`})
                                            }
                                        }else{
                                            res.json({"status":false, "message":"Kyc verification is must to place the order"})
                                        }                                       
                                    }else{
                                        res.json({"status":false, "message":"You cannot buy or sell with your own order"})
                                    }
                                }else{
                                    res.json({"status":false, "message":"This order has been completed already"})
                                }
                            }else{
                                res.json({"status":false, "message":"This order has been completed already"})
                            }
                        }else{
                            res.json({"status":false, "message":"Invalid Id"})
                        }
                    })
                }else{
                    if(data._id == undefined){
                        res.json({"status":false, "message":"Id is required"})
                    }else if(data.amount == undefined){
                        res.json({"status":false, "message":"Amount is required"})
                    }else{
                        res.json({"status":false, "message":"Ordertype is required"})
                    } 
                }
            }else{
                res.json({"status":false, "message":"Unauthorized person"})
            }
        })
    }catch(err){
        console.log("Error catched in create order", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

let orderEmit = exports.orderEmit = (Id)=>{
    socket_config.sendmessage('emitMapping', {"_id": Id}) 
}

//buyer confirmation
router.post('/api/v1/user/p2p/buyerConfirmation',  auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        if(data._id != undefined && typeof data._id != 'undefined'){
            p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getorder)=>{
                if(!err && getorder != null){
                    p2pmappingDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"buyerConfirmation":true, "buyerDatetime":new Date()}}, (err, buyupdate)=>{
                        if(!err && buyupdate){
                            p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, mapdata)=>{
                                socket_config.sendmessage("mapDetails", mapdata);
                                res.json({"status":true, "message":"Buyer confirmed successfully"})
                            })
                        }else{
                            res.json({"status":false, "message":"Error occurred in buyer confirmation. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }else{
            res.json({"status":false, "message":"Id is required"})
        }
    }catch(err){
        console.log("Error catched in buyer confirmation", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//seller confirmation
router.post('/api/v1/user/p2p/sellerConfirmation', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        p2pmappingDB.aggregate([
            {
                "$lookup":{
                    "from":"MRADULEXG_ORDERP2P",
                    "localField":"orderId",
                    "foreignField":"_id",
                    "as":"orderdata"
                }
            },
            {
                "$project":{
                    "buyUserId":1,
                    "sellUserId":1,
                    "orderId":1,
                    "amount":1,
                    "price":1,
                    "total":1,
                    "orderType":1,
                    "sellerConfirmation":1,
                    "buyerConfirmation":1,
                    "buyerDatetime":1,
                    "sellerDatetime":1,
                    "datetime":1,
                    "_id":1,
                    "firstCurrency":{"$arrayElemAt":["$orderdata.firstCurrency", 0]},
                    "secondCurrency":{"$arrayElemAt":["$orderdata.secondCurrency", 0]},
                }
            },
            {
                "$match":{
                    "_id":mongoose.Types.ObjectId(data._id)
                }
            }
        ], (err, getorder)=>{
            if(!err && getorder.length > 0){
                buyerBalanceUpdate(getorder[0], (balupdate)=>{
                    if(balupdate){
                        p2pmappingDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"sellerConfirmation":true, "sellerDatetime":new Date()}}, (err, buyupdate)=>{
                            if(!err && buyupdate){
                                p2porderDB.findOne({"_id":mongoose.Types.ObjectId(getorder[0].orderId)}, (err, orderdet)=>{
                                    if(!err && orderdet){
                                        let availableAmount = orderdet.availableAmount - getorder[0].amount;
                                        let status = 2;
                                        if(availableAmount == 0){
                                            status = 1;
                                        }
                                        p2porderDB.updateOne({"_id":mongoose.Types.ObjectId(getorder[0].orderId)}, {"availableAmount":availableAmount, "status":status}, (err, updated)=>{
                                            p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, mapdata)=>{
                                                socket_config.sendmessage("mapDetails", mapdata);
                                                res.json({"status":true, "message":"Seller confirmed successfully"})
                                            })
                                        })
                                    }else{
                                        res.json({"status":false, "message":"Error occurred in seller confirmation. Please try again later"})
                                    }
                                })
                                
                            }else{
                                res.json({"status":false, "message":"Error occurred in seller confirmation. Please try again later"})
                            }
                        })
                    }else{
                        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"}) 
                    }
                }) 
            }else{
                res.json({"status":false, "message":"Error occurred in get order. Please try again later"})
            }
        })
    }catch(err){
        console.log("Error catched in seller confirmation", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

function buyerBalanceUpdate(order, callback){
    userDB.findOne({"_id":mongoose.Types.ObjectId(order.buyUserId)}, (err, getuser)=>{
        if(!err && getuser != null){
            userwalletDB.findOne({"userId":mongoose.Types.ObjectId(order.buyUserId), "wallet.currency":order.firstCurrency.toLowerCase()}, {"wallet.$":1}, (err, getbal)=>{
                if(!err && getbal){
                    let curbal = getbal.wallet[0].amount;
                    let newbal = curbal + order.amount;
                    newbal = newbal.toFixed(8);
                    userwalletDB.updateOne({"userId":mongoose.Types.ObjectId(order.buyUserId), "wallet.currency":order.firstCurrency.toLowerCase()}, {"$set":{"wallet.$.amount":newbal}}, (err, updated)=>{
                        if(!err && updated){
                            callback(true);
                        }else{
                            callback(false);
                        }
                    })
                }else{
                    callback(false);
                }
            })
        }else{
            callback(false);
        }
    })
}

//mapping status
router.post('/api/v1/user/p2p/mappingStatus', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;//_id
        p2pmappingDB.aggregate([
            {
                "$lookup":{
                    "from":"MRADULEXG_PTPUSER",
                    "localField":"sellUserId",
                    "foreignField":"_id",
                    "as":"selluser"
                }
            },
            {
                "$lookup":{
                    "from":"MRADULEXG_PTPUSER",
                    "localField":"buyUserId",
                    "foreignField":"_id",
                    "as":"buyuser"
                } 
            },
            {
                "$lookup":{
                    "from":"MRADULEXG_ORDERP2P",
                    "localField":"orderId",
                    "foreignField":"_id",
                    "as":"orderdata"
                }
            },
            {
                "$project":{
                    "sellerId":{"$arrayElemAt":["$selluser._id", 0]},
                    "sellerEmail":{"$arrayElemAt":["$selluser.email", 0]},
                    "sellerUsername":{"$arrayElemAt":["$selluser.username", 0]},
                    "sellerBankinfo":{"$arrayElemAt":["$selluser.bank_info", 0]},
                    "sellerBankstatus":{"$arrayElemAt":["$selluser.bank_status", 0]},
                    "sellerPayment":{"$arrayElemAt":["$selluser.payment", 0]},
                    "buyerId":{"$arrayElemAt":["$buyuser._id", 0]},
                    "buyerEmail":{"$arrayElemAt":["$buyuser.email", 0]},
                    "buyerUsername":{"$arrayElemAt":["$buyuser.username", 0]},
                    "buyerBankinfo":{"$arrayElemAt":["$buyuser.bank_info", 0]},
                    "buyerBankstatus":{"$arrayElemAt":["$buyuser.bank_status", 0]},
                    "buyerPayment":{"$arrayElemAt":["$buyuser.payment", 0]},
                    "firstCurrency":{"$arrayElemAt":["$orderdata.firstCurrency", 0]},
                    "secondCurrency":{"$arrayElemAt":["$orderdata.secondCurrency", 0]},
                    "payments":{"$arrayElemAt":["$orderdata.paymentMethod", 0]},
                    "iskycNeed":{"$arrayElemAt":["$orderdata.isKycNeed", 0]},
                    "remarks":{"$arrayElemAt":["$orderdata.remarks", 0]},
                    "sellerConfirmation":1,
                    "buyerConfirmation":1,
                    "orderId":1,
                    "amount":1,
                    "price":1,
                    "total":1,
                    "orderType":1,
                    "datetime":1,
                    "_id":1
                }
            },
            {
                "$match":{
                    "_id":mongoose.Types.ObjectId(data._id)
                }
            }
        ], (err, result)=>{
            if(!err && result.length > 0){
                result[0].sellerEmail = encrypter.decrypt_data(result[0].sellerEmail);
                result[0].buyerEmail = encrypter.decrypt_data(result[0].buyerEmail);
                siteDB.findOne({}, (err, getsitedata)=>{
                    console.log("p2ptimer", getsitedata)
                    if(!err && getsitedata != null){
                        result[0].p2ptimer = getsitedata.p2p_timer;
                        res.json({"status":true, "message":"success", "data":result[0]})
                    }else{
                        result[0].p2ptimer = 0;
                        res.json({"status":true, "message":"success", "data":result[0]})
                    }
                })    
            }else{
                res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
            }
        })   
    }catch(err){
        console.log("Error catched in mapping status", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//chat add
router.post('/api/v1/user/p2p/chat', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;//_id, message
        if(data._id != undefined && typeof data._id != 'undefined' && data.message != undefined && typeof data.message != 'undefined'){
            userDB.findOne({"_id":mongoose.Types.ObjectId(req.user_id)}, (err, getuser)=>{
                if(!err && getuser != null){
                    data.datetime = new Date();
                    data.userId = req.user_id;
                    data.avatar = getuser.avatar;
                    p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getmapdata)=>{
                        if(!err && getmapdata != null){
                            p2pmappingDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$push":{"chats":data}}, (err, chatupdate)=>{
                                if(!err && chatupdate){
                                    res.json({"status":true, "message":"Chat added successfully"});
                                    socket_config.sendmessage('chatList', data);
                                }else{
                                    res.json({"status":false, "message":"Error occurred in p2p chat data. Please try again later"})
                                }
                            })
                        }else{
                            res.json({"status":false, "message":"Invalid Id"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"User Does not exist"})
                }
            })  
        }else{
            if(data.message == undefined){
                res.json({"status":false, "message":"Message is required"})
            }else{
                res.json({"status":false, "message":"Id is required"})
            }
        }
    }catch(err){
        console.log("Error catched in p2p chat", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//get chat
router.post('/api/v1/user/p2p/getChat', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;//_id
        if(data._id != undefined && typeof data._id != 'undefined'){
            p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getmapdata)=>{
                if(!err && getmapdata != null){
                    res.json({"status":true, "message":"success", "data":getmapdata.chats})
                }else{
                    res.json({"status":true, "message":"success", "data":[]})
                }
            })
        }else{
            res.json({"status":false, "message":"Id is required"})
        }
    }catch(err){
        console.log("Error catched in get chat", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//cancel
router.post('/api/v1/user/p2p/orderCancel', auth.isauthenticated, (req, res)=>{
    try{
        let userId = mongoose.Types.ObjectId(req.user_id);
        let data = req.body;
        if(data._id != undefined && typeof data._id != 'undefined'){
            p2porderDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getorder)=>{
                if(!err && getorder != null){
                    if(getorder.status == 0 || getorder.status == 2){
                        if(getorder.orderType == "buy"){
                            p2porderDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"status":3}}, (err, orderupdate)=>{
                                res.json({"status":true, "message":"Order cancelled successfully"})
                            })
                        }else{
                            // let availableAmount = getorder.availableAmount;
                            // userwalletDB.findOne({"userId":mongoose.Types.ObjectId(userId), "wallet.currency":getorder.firstCurrency.toLowerCase()}, {"wallet.$":1}, (err, getbal)=>{
                            //     if(!err && getbal){
                            //         let curbal = getbal.wallet[0].amount;
                            //         let newbal = curbal + availableAmount;
                            //         newbal = newbal.toFixed(8);
                            //         userwalletDB.updateOne({"userId":mongoose.Types.ObjectId(userId), "wallet.currency":getorder.firstCurrency.toLowerCase()}, {"$set":{"wallet.$.amount":newbal}}, (err, updated)=>{
                            //             if(!err && updated){
                                            p2porderDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"status":3}}, (err, orderupdate)=>{
                                                res.json({"status":true, "message":"Order cancelled successfully"})
                                            })
                            //             }else{
                            //                 res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                            //             }
                            //         })
                            //     }else{
                            //         res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                            //     }
                            // })
                        }
                    }else{
                        res.json({"status":false, "message":"This order has been already processed"})
                    }
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }else{
            res.json({"status":false, "message":"Id is required"})
        }
    }catch(err){
        console.log("Error catched in order cancel", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//dispute raise
router.post('/api/v1/user/p2p/disputeRaise', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;//_id, proof, reason
        if(data._id != undefined && typeof data._id != 'undefined' && data.proof != undefined && typeof data.proof != 'undefined' &&data.reason != undefined && typeof data.reason != 'undefined'){
            p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getmapdata)=>{
                if(!err && getmapdata != null){
                    let obj = {
                        "proof":data.proof,
                        "reason":data.reason,
                        "dispute":true,
                        "disputeRaiser":req.user_id,
                        "disputeDatetime":new Date(),
                        "favour":""
                    }
                    p2pmappingDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":obj}, (err, updated)=>{
                        if(!err && updated){
                            res.json({"status":true, "message":"Dispute raised successfully"})
                        }else{
                            res.json({"status":false, "message":"Error occurred in raise dispute. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }else{
            if(data._id == undefined){
                res.json({"status":false, "message":"Id is required"})
            }else if(data.proof == undefined){
                res.json({"status":false, "message":"Proof is required"})
            }else{
                res.json({"status":false, "message":"Reason is required"})
            }
        }
    }catch(err){
        console.log("Error catched in dispute raise", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//p2p notification get
router.get('/api/v1/user/p2p/getNotification', auth.isauthenticated, (req, res)=>{
    try{
        let userId = mongoose.Types.ObjectId(req.user_id);
        p2pnotiDB.find({"userId":userId}).sort({"_id":-1}).exec((err, getnoti)=>{
            if(!err && getnoti.length > 0){
                res.json({"status":true, "message":"success", "data":getnoti})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in p2p get notification", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//p2p status change
router.post('/api/v1/user/p2p/chatAsRead', auth.isauthenticated, (req, res)=>{
    try{
        let userId = mongoose.Types.ObjectId(req.user_id);
        let data = req.body;
        if(data._id != undefined && typeof data._id != 'undefined'){
            p2pnotiDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getnoti)=>{
                if(!err && getnoti != null){
                    p2pnotiDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"status":1}}, (err, updatenoti)=>{
                        if(!err && updatenoti){
                            res.json({"status":true, "message":"success"})
                        }else{
                            res.json({"status":false, "message":"Error occurred in read chat. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }else{
            res.json({"status":false, "message":"Id is required"})
        }
    }catch(err){
        console.log("Error catched in p2p chat as read", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//update payment method
router.post('/api/v1/user/p2p/updatePayment', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body; 
        let userId = mongoose.Types.ObjectId(req.user_id);
        userDB.findOne({"_id":userId, "payment.name":data.name}, (err, getuser)=>{
            if(!err && getuser != null){
                userDB.updateOne({"_id":userId, "payment.name":data.name}, {"$set":{"payment.$":data}}, (err, updated)=>{
                    if(!err && updated){
                        p2puserDB.updateOne({"_id":userId, "payment.name":data.name}, {"$set":{"payment.$":data}}, (err, updated1)=>{
                            res.json({"status":true, "message":"Payment upated successfully"})
                        })
                    }else{
                        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                    }
                })
            }else{
                userDB.updateOne({"_id":userId}, {"$push":{"payment":data}}, (err, added)=>{
                    if(!err && added){
                        p2puserDB.updateOne({"_id":userId}, {"$push":{"payment":data}}, (err, added1)=>{
                            res.json({"status":true, "message":"Payment added successfully"})
                        })
                    }else{
                        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                    }
                })
            }
        })
    }catch(err){
        console.log("Error catched in update payment", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

module.exports = router;