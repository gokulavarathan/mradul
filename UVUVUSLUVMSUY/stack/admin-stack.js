const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../../helper/auth');

const currencyDB = require('../../model/currency');
const stackplanDB = require('../../model/stackplan');
const stackDB = require('../../model/stack');

router.post('/api/v1/admin/addStakePlans', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated,  (req, res)=>{
    try{
        let datas = req.body;
        currencyDB.findOne({"symbol":datas.currency}, (err, getcurrency)=>{
            if(!err && getcurrency != null){
                stackplanDB.findOne({"currency":datas.currency, "plan":datas.plan}, (err, stack_data)=>{
                    if(!err && stack_data == null){
                        let stack_details = {
                            plan: datas.plan,
                            currency: datas.currency,
                            min_amount: parseFloat(datas.min_amount),
                            max_amount: parseFloat(datas.max_amount),
                            return_percentage: datas.return_percentage,
                            weekly_percentage: datas.weekly_percentage,
                            daily_percentage: datas.weekly_percentage / 7,
                            total_weeks: datas.total_weeks,
                        }
                        stackplanDB.create(stack_details, (err, created)=>{
                            if(!err && created){
                                res.json({"status":true, "message":"success", "data":stack_details})
                            }else{
                                res.json({"status":false, "message":"Error occurred in stack creation. Please try again later"})
                            }
                        })
                    }else{
                        res.json({"status":false, "message":"Plan already exists"})
                    }
                })
            }else{
                res.json({"status":false, "message":"Invalid currency"})
            }
        })
    }catch(err){
        console.log("Error catched in add stake plans", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/api/v1/admin/deleteStakePlans', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated,  (req, res)=>{
    try{
        let data = req.body;
        stackplanDB.findOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, getstack)=>{
            if(!err && getstack != null){
                stackplanDB.deleteOne({"_id":mongoose.Types.ObjectId(data._id)}, (err, deleted)=>{
                    if(!err && deleted){
                        res.json({"status":true, "message":"Stack deleted successfully"})
                    }else{
                        res.json({"status":false, "message":"Error occurred in delete stack. Please try again later"})
                    }
                })
            }else{
                res.json({"status":false, "message":"Invalid Id"})
            }
        })
    }catch(err){
        console.log("Error catched in delete stack plan", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/api/v1/admin/getStakePlanList', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated,  (req, res)=>{
    try{
        stackplanDB.find({}, (err, stakes)=>{
            if(!err && stakes.length > 0){
                res.json({"status":true, "message":"success", "data":stakes})
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in get stake plan list", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

router.post('/api/v1/admin/getUserStakeList', auth.verify_origin,
auth.isAdmin,
auth.isauthenticated, (req, res)=>{
    try{
        stackDB.aggregate([
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
                    "plan":1,
                    "currency":1,
                    "amount":1,
                    "return_percentage":1,
                    "weekly_percentage":1,
                    "daily_percentage":1,
                    "daily_rewards":1,
                    "type":1,
                    "status":1,
                    "remaining_days":1,
                    "completed_days":1,
                    "total_rewards":1,
                    "total_weeks":1,
                    "start_date":1,
                    "end_date":1,
                    "created_date":1,
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

module.exports = router;