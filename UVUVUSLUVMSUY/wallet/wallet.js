const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../../helper/auth');

const userDB = require('../../model/user');
const currencyDB = require('../../model/currency');
const walletDB = require('../../model/wallet');
const p2pwalletDB = require('../../model/p2p-wallet');
const stackwalletDB = require('../../model/stack-wallet');
const borrowWalletDB = require('../../model/borrow-wallet');
const walletTransferDB = require('../../model/wallet-transfer-history');
const profitDB = require('../../model/profit');

//transfer
router.post('/api/v1/user/wallet/transfer', auth.isauthenticated, (req, res)=>{
    try{
        let data = req.body;//fromWallet, toWallet, userId, amount, currencySymbol
        let userid = mongoose.Types.ObjectId(req.user_id);
        if(data.fromWallet != undefined && typeof data.fromWallet != 'undefined' && data.toWallet != undefined && typeof data.toWallet != 'undefined' && data.amount != undefined && typeof data.amount != 'undefined' && data.currencySymbol != undefined && typeof data.currencySymbol != 'undefined'){
            if(data.fromWallet == "exchange" || data.fromWallet == "p2p" || data.fromWallet == "stack" || data.fromWallet == "borrow"){
                if(data.toWallet == "exchange" || data.toWallet == "p2p" || data.toWallet == "stack" || data.toWallet == "borrow"){
                    userDB.findOne({"_id":userid}, (err, getuser)=>{
                        if(!err && getuser != null){
                            currencyDB.findOne({"symbol":data.currencySymbol.toLowerCase()}, (err, getcurrency)=>{
                                if(!err && getcurrency != null){
                                    if(data.fromWallet != data.toWallet){
                                        let fromDB;
                                        if(data.fromWallet == "exchange"){
                                            fromDB = walletDB;
                                        }else if(data.fromWallet == "p2p"){
                                            fromDB = p2pwalletDB;
                                        }else if(data.fromWallet == "stack"){
                                            fromDB = stackwalletDB;
                                        }else{
                                            fromDB = borrowWalletDB;
                                        }
                                        let toDB;
                                        if(data.toWallet == "exchange"){
                                            toDB = walletDB;
                                        }else if(data.toWallet == "p2p"){
                                            toDB = p2pwalletDB;
                                        }else if(data.toWallet == "stack"){
                                            toDB = stackwalletDB;
                                        }else{
                                            toDB = borrowWalletDB;
                                        }
                                        fromDB.findOne({"userId":mongoose.Types.ObjectId(getuser._id), "wallet.currency":getcurrency.symbol}, {"wallet.$":1}, (err, getbalance1)=>{
                                            if(!err && getbalance1){
                                                let frombal = getbalance1.wallet[0].amount;
                                                if(frombal >= data.amount){
                                                    toDB.findOne({"userId":mongoose.Types.ObjectId(getuser._id), "wallet.currency":getcurrency.symbol}, {"wallet.$":1}, (err, getbalance2)=>{
                                                        if(!err && getbalance2){
                                                            let tobal = getbalance2.wallet[0].amount;
                                                            let remainbal = frombal - data.amount;
                                                            fromDB.updateOne({"userId":mongoose.Types.ObjectId(getuser._id), "wallet.currency":getcurrency.symbol}, {"wallet.$.amount":remainbal}, (err, reducebal)=>{
                                                                if(!err && reducebal){
                                                                    let feeper = getcurrency.walletTransferFee;
                                                                    let fee = data.amount * (feeper/100);
                                                                    let receiveamount = data.amount - fee;
                                                                    let updatebal = tobal + receiveamount;
                                                                    toDB.updateOne({"userId":mongoose.Types.ObjectId(getuser._id), "wallet.currency":getcurrency.symbol}, {"wallet.$.amount":updatebal}, (err, updatebal)=>{
                                                                        if(!err && updatebal){
                                                                            let input = {
                                                                                "fromWallet":data.fromWallet,
                                                                                "toWallet":data.toWallet,
                                                                                "amount":data.amount,
                                                                                "fee":fee,
                                                                                "feePercent":feeper,
                                                                                "receiveAmount":receiveamount,
                                                                                "userId":userid,
                                                                                "currencyId":getcurrency._id,
                                                                                "currencySymbol":getcurrency.symbol
                                                                            }
                                                                            walletTransferDB.create(input, (err, historycreated)=>{
                                                                                if(!err && historycreated){
                                                                                    let proinput = {
                                                                                        "category":'wallet-transfer', 
                                                                                        "currency":input.currencySymbol.toLowerCase(), 
                                                                                        "profit":input.fee, 
                                                                                        "reference":historycreated._id
                                                                                    }
                                                                                    profitDB.create(proinput, (err, profitcreated)=>{
                                                                                        if(!err && profitcreated){
                                                                                            res.json({"status":true, "message":"Transfered successfully"})
                                                                                        }else{
                                                                                            res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                                                                                        }
                                                                                    })    
                                                                                }else{
                                                                                    res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                                                                                }
                                                                            })
                                                                            
                                                                        }else{
                                                                            res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                                                                        }
                                                                    })
                                                                }else{
                                                                    res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                                                                }
                                                            })
                                                        }else{
                                                            res.json({"status":false, "message":"Insufficient balance"})
                                                        }
                                                    })
                                                }else{
                                                    res.json({"status":false, "message":"Insufficient balance"})
                                                }
                                            }else{
                                                res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
                                            }
                                        })
                                    }else{
                                        res.json({"status":false, "message":"Source wallet and destination wallet should not be same"})
                                    }
                                }else{
                                    res.json({"status":false, "message":"Invalid currency"})
                                }
                            })
                        }else{
                            res.json({"status":false, "message":"Invalid user"})
                        }
                    })
                }else{
                    res.json({"status":false, "message":"Invalid to wallet"})
                }
            }else{
                res.json({"status":false, "message":"Invalid from wallet"})
            }
        }else{
            if(data.fromWallet == undefined){
                res.json({"status":false, "message":"From wallet is required"})
            }else if(data.toWallet == undefined){
                res.json({"status":false, "message":"To wallet is required"})
            }else if(data.amount == undefined){
                res.json({"status":false, "message":"Amount is required"})
            }else{
                res.json({"status":false, "message":"Currency symbol is required"})
            } 
        }
    }catch(err){
        console.log("Error catched in transfer", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

//show balance list
router.post('/api/v1/user/wallet/getBalance', auth.isauthenticated, (req, res)=>{
    try{
        let userId = mongoose.Types.ObjectId(req.user_id);
        let data = req.body;
        userDB.findOne({"_id":userId}, (err, getuser)=>{
            if(!err && getuser != null){
                if(data.type != undefined && typeof data.type != 'undefined'){
                    if(data.type == "exchange" || data.type == "p2p" || data.type == "stack" || data.type == "borrow"){
                        let db;
                        if(data.type == "exchange"){
                            db = walletDB;
                        }else if(data.type == "p2p"){
                            db = p2pwalletDB;
                        }else if(data.type == "stack"){
                            db = stackwalletDB;
                        }else{
                            db = borrowWalletDB;
                        }
                        // if(data.type != "exchange"){
                        //     db.findOne({"userId":userId}, (err, getwallet)=>{
                        //         if(!err && getwallet != null){
                        //             res.json({"status":true, "message":"Success", "data":getwallet.wallet})
                        //         }else{
                        //             res.json({"status":true, "message":"Success", "data":[]})
                        //         }
                        //     })
                        // }else{
                            db.aggregate([
                                {
                                    "$match":{
                                        "userId":userId
                                    }
                                },
                                {
                                    "$unwind":"$wallet"
                                },
                                {
                                    "$lookup":{
                                        "from":"MRADULEXG_CURRDETSTE",
                                        "localField":"wallet.currency",
                                        "foreignField":"symbol",
                                        "as":"curr"
                                    }
                                },
                                {
                                    "$project":{
                                        "currency":"$wallet.currency",
                                        "amount":"$wallet.amount",
                                        "hold":"$wallet.hold",
                                        "currencyname":{"$arrayElemAt":["$curr.currency", 0]},
                                        "currencyimage":{"$arrayElemAt":["$curr.logo", 0]},
                                        "deposit":{"$arrayElemAt":["$curr.deposit", 0]},
                                        "withdraw":{"$arrayElemAt":["$curr.withdraw", 0]},
                                        "btcvalue":{"$arrayElemAt":["$curr.btc_value", 0]},
                                        "fee":{"$arrayElemAt":["$curr.walletTransferFee", 0]}
                                    }
                                }
                            ], (err, results)=>{
                                if(!err && results.length > 0){
                                    res.json({"status":true, "message":"Success", "data":results})
                                }else{
                                    res.json({"status":true, "message":"Success", "data":[]})
                                }
                            })
                        // }
                    }else{
                        res.json({"status":false, "message":"Invalid type"})
                    }
                   
                }else{
                    res.json({"status":false, "message":"Type is required"})
                }
            }else{
                res.json({"status":false, "message":"Invalid user"})
            }
        }) 
    }catch(err){
        console.log("Error catched in get balance", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

module.exports = router;