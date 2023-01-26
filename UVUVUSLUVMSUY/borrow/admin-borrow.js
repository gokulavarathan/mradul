const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../../helper/auth');

const borrowPairDB = require('../../model/borrow-pair');
const borrowDB = require('../../model/borrow');
const currencyDB = require('../../model/currency');

router.get('/api/v1/admin/borrowPair', auth.verify_origin,
    auth.isAdmin,
    auth.isauthenticated, (req, res) => {
        var datas = req.body
        currencyDB.findOne({ 'symbol': datas.borrow_currency }, (err, borrow_currency_data) => {
            if (!err && borrow_currency_data != null) {
                currencyDB.findOne({ 'symbol': datas.collateral_currency }, (err, collatral_currency_data) => {
                    if (!err && collatral_currency_data != null) {
                        borrowPairDB.findOne({ 'borrow_currency': datas.borrow_currency, 'collateral_currency': datas.collateral_currency }, (err, isExistsBorrow) => {
                            if (!err && isExistsBorrow != null) {
                                let borrowPair_details = {
                                    borrow_currency: datas.borrow_currency,
                                    collateral_currency: datas.collateral_currency,
                                    borrow_value: parseFloat(datas.borrow_value),
                                    collateral_value: parseFloat(datas.collateral_value),
                                    min_amount: parseFloat(datas.min_amount),
                                    max_amount: parseFloat(datas.max_amount),
                                    daily_interest_rate: datas.daily_interest_rate,
                                    hourly_interest_rate: (datas.daily_interest_rate) / 24,
                                    loan_term: `${datas.repayment_days} days`,
                                    repayment_days: datas.repayment_days,
                                }
                                borrowPairDB.create(borrowPair_details, async (err, created) => {
                                    if (created) {
                                        res.json({ "status": true, "message": "success", "data": created })
                                    }
                                    else {
                                        res.json({ "status": false, "message": "did not create borrow" })
                                    }
                                })
                            } else {
                                res.json({ "status": false, "message": "borrow pair already exists!" })
                            }
                        })
                    } else {
                        res.json({ "status": false, "message": "currency does not exists!" })
                    }
                })
            } else {
                res.json({ "status": false, "message": "currency does not exists!" })
            }
        })
    }
);

router.post('/api/v1/admin/deleteBorrowPair', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated,  (req, res)=>{
    try{
        let data = req.body;
        borrowPairDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getborrow)=>{
            if(!err && getborrow != null){
                borrowPairDB.deleteOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, deleted)=>{
                    if(!err && deleted){
                        res.json({"status":true, "message":"Borrow pair deleted successfully"})
                    }else{
                        res.json({"status":false, "message":"Error occurred in delete borrow pair. Please try again later"})
                    }
                })
            }else{
                res.json({"status":false, "message":"Invalid Id"})
            }
        })
    }catch(err){
        console.log("Error catched in delete borrow pair", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/api/v1/admin/getUserBorrowList', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        borrowDB.aggregate([
            {
                "$lookup":{
                    "from":"MRADULEXG_STEUSE",
                    "localField":"userId",
                    "foreignField":"_id",
                    "as":"userdata"
                }
            },
            {
                "$project":{
                    "borrow_currency":1,
                    "collateral_currency":1,
                    "borrow_amount":1,
                    "collateral_amount":1,
                    "daily_interest_rate":1,
                    "hourly_interest_rate":1,
                    "loan_term":1,
                    "repayment_days":1,
                    "status":1,
                    "created_at":1,
                    "email":{"$arrayElemAt":["$userdata.email", 0]}
                }
            },
            {
                "$sort":{
                    "created_date":-1
                }
            }
        ], (err, results)=>{
            if(!err && results.length > 0){
                let count = 0;
                for(let i=0; i<results.length; i++){
                    let decemail = Encrypter.decrypt_data(results[i].email);
                    results[i].email = decemail;
                    count++;
                    if(count == results.length){
                        res.json({"status":true, "message":"success", "data":results})
                    }
                }
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in get user stake list", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})