const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const common = require('../../helper/db2');
const auth = require('../../helper/auth');

const userDB = require('../../model/user');
const userwalletDB = require('../../model/p2p-wallet');

const payment = common.getSecondaryDB().model('payment');
const p2pcurrency = common.getSecondaryDB().model('p2p_currency');
const p2pmappingDB = common.getSecondaryDB().model('ordermapping');
const p2porderDB = common.getSecondaryDB().model('orderp2p');

router.post('/p2p/admin/addPayment', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        if(data.paymentGateway != undefined && typeof data.paymentGateway != 'undefined' && data.status != undefined && typeof data.status != 'undefined'){
            payment.findOne({"paymentGateway":data.paymentGateway}, (err, getpayment)=>{
                if(!err && getpayment == null){
                    payment.create(data, (err, created)=>{
                        if(!err && created){
                            res.json({"status":true, "message":"Payment added successfully"})
                        }else{
                            res.json({"status":false, "message":"Error in add payment. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Payment already exist"})
                }
            })
        }else{
            if(data.paymentGateway == undefined){
                res.json({"status":false, "message":"Payment gateway name is required"})
            }else{
                res.json({"status":false, "message":"status is required"})
            }
        }  
    }catch(err){
        console.log("Error in add payment", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.get('/p2p/admin/getPayment', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        payment.find((err, getlist)=>{
            if(!err && getlist.length > 0){
                res.json({"status":true, "message":"success", "data":getlist})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error in get payment", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/p2p/admin/updatePayment', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        if(data._id != undefined && typeof data._id != 'undefined'){
            payment.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getpayment)=>{
                if(!err && getpayment){
                    payment.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":data}, (err, updatepayment)=>{
                        if(!err && updatepayment){
                            res.json({"status":true, "message":"Payment updated successfully"})
                        }else{
                            res.json({"status":false, "message":"Error occurred in update payment. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Invalid id"})
                }
            })
        }else{
            res.json({"status":false, "message":"Id is required"})
        }
    }catch(err){
        console.log("Error in update payment", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/p2p/admin/addCurrency',  auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        if(data.currency != undefined && typeof data.currency != 'undefined' && data.symbol != undefined && typeof data.symbol != 'undefined' && data.logo != undefined && typeof data.logo != 'undefined' && data.status != undefined && typeof data.status != 'undefined' && data.type != undefined && typeof data.type != 'undefined'){
            p2pcurrency.findOne({"symbol":data.symbol}, (err, getcurrency)=>{
                if(!err && getcurrency == null){
                    p2pcurrency.create(data, (err, created)=>{
                        if(!err && created){
                            res.json({"status":true, "message":"Currency added successfully"})
                        }else{  
                            res.json({"status":false, "message":"Error occurred in currency add. Please try again later"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Currency already exist"})
                }
            })
        }else{
            if(data.currency == undefined){
                res.json({"status":false, "message":"Currency is required"})
            }else if(data.symbol == undefined){
                res.json({"status":false, "message":"Symbol is required"})
            }else if(data.logo == undefined){
                res.json({"status":false, "message":"Logo is required"})
            }else if(data.status == undefined){
                res.json({"status":false, "message":"Status is required"})
            }else{
                res.json({"status":false, "message":"Type is required"})
            }
        }
    }catch(err){
        console.log("Error in add currency", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/p2p/admin/updateCurrency', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;
        if(data._id != undefined && typeof data._id != 'undefined'){
            p2pcurrency.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getcurrency)=>{
                if(!err && getcurrency != null){
                    p2pcurrency.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":data}, (err, updatecurrency)=>{
                        if(!err && updatecurrency != null){
                            res.json({"status":true, "message":"Currency updated successfully"})
                        }else{
                            res.json({"status":false, "message":"Error occurred in update currency. Please try again later"})
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
        console.log("Error in update currency", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.get('/p2p/admin/getCurrency', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        p2pcurrency.find((err, getlist)=>{
            if(!err && getlist.length > 0){
                res.json({"status":true, "message":"success", "data":getlist})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error in update currency", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//dispute list
router.get('/p2p/admin/disputeList', auth.verify_origin, auth.isAdmin, auth.isauthenticated, (req, res)=>{
    try{
        p2pmappingDB.find({"dispute":true, "favour":""}, (err, getlist)=>{
            if(!err && getlist.length > 0){
                res.json({"status":true, "message":"success", "data":getlist})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in dispute list", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/p2p/admin/disputefavour', auth.verify_origin, auth.isAdmin, auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;//_id, favour
        if(data._id !=  undefined && typeof data._id != 'undefined' && data.favour != undefined && typeof data.favour != 'undefined'){
            p2pmappingDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getdata)=>{
                if(!err && getdata != null){
                    if(getdata.favour == ""){
                        if(data.favour == "buyer" || data.favour == "seller"){
                            if(data.favour == "buyer"){
                                p2porderDB.findOne({"_id":mongoose.Types.ObjectId(getdata.orderId)}, (err, getorder)=>{
                                    if(!err && getorder != null){
                                        buyerBalanceUpdate(getdata, getorder, (result)=>{
                                            p2pmappingDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"favour":data.favour}}, (err, mapupdate)=>{
                                                res.json({"status":true, "message":"Favoured to buyer successfully"})
                                            })
                                        })  
                                    }else{
                                        res.json({"status":false, "message":"Error occurred in dispute. Please try again later"})
                                    }
                                })
                            }else{
                                p2pmappingDB.updateOne({"_id":mongoose.Types.ObjectId(data._id)}, {"$set":{"favour":data.favour}}, (err, mapupdate)=>{
                                    res.json({"status":true, "message":"Favoured to seller successfully"})
                                })
                            }
                        }else{
                            res.json({"status":false, "message":"Invalid favour"})
                        }
                    }else{
                        res.json({"status":false, "message":"This request has been already processed"})
                    }
                }else{
                    res.json({"status":false, "message":"Invalid Id"})
                }
            })
        }else{
            if(data._id == undefined){
                res.json({"status":false, "message":"Id is required"})
            }else{
                res.json({"status":false, "message":"Favour is required"})
            }    
        }    
    }catch(err){
        console.log("Error in dispute favour", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})


function buyerBalanceUpdate(maporder, order, callback){
    userDB.findOne({"_id":mongoose.Types.ObjectId(maporder.buyUserId)}, (err, getuser)=>{
        if(!err && getuser != null){
            userwalletDB.findOne({"userId":mongoose.Types.ObjectId(maporder.buyUserId), "wallet.currency":order.firstCurrency.toLowerCase()}, {"wallet.$":1}, (err, getbal)=>{
                if(!err && getbal){
                    let curbal = getbal.wallet[0].amount;
                    let newbal = curbal + maporder.amount;
                    newbal = newbal.toFixed(8);
                    userwalletDB.updateOne({"userId":mongoose.Types.ObjectId(maporder.buyUserId), "wallet.currency":order.firstCurrency.toLowerCase()}, {"$set":{"wallet.$.amount":newbal}}, (err, updated)=>{
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

module.exports = router;