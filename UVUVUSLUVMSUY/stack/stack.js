const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../../helper/auth');

const stackplanDB = require('../../model/stackplan');
const stackDB = require('../../model/stack');
const stakeHistoryDB = require('../../model/stack-history');
const userDB = require('../../model/user');
const commission = require('../../model/referral-commission');
const stackwalletDB = require('../../model/stack-wallet');

router.get('/api/v1/user/getStakePlans', (req, res) => {
    try {
        stackplanDB.find({ "status": "active" }, (err, getlist) => {
            if (!err && getlist.length > 0) {
                res.json({ "status": true, "message": "success", "data": getlist })
            } else {
                res.json({ "status": true, "message": "success", "data": [] })
            }
        })
    } catch (err) {
        console.log("Error catched in stake plans", err);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
})

router.post('/api/v1/user/addStake', auth.isauthenticated, (req, res) => {
    let datas = req.body
    let user_id = mongoose.Types.ObjectId(req.user_id);
    let currency = datas.currency.toLowerCase();
    userDB.findOne({ "_id": user_id }, (err, user_data) => {
        if (!err && user_data != null) {
            stackplanDB.findOne({ "plan": datas.plan }, (err, plan_data) => {
                if (!err && plan_data != null) {
                    stack_fee = plan_data.fee / 100;
                    stackwalletDB.findOne({ "userId": user_id, "wallet.currency": currency }, { "wallet.$": 1 }, (err, wallet_data) => {
                        if (!err && wallet_data != null) {
                            let wallet_balance = wallet_data.wallet[0].amount,
                                daily_rewards = (datas.amount / 100) * (plan_data.weekly_percentage / 7);
                            apr_amount = (datas.amount / 100) * (plan_data.return_percentage);
                            if (datas.amount >= plan_data.min_amount && datas.amount <= plan_data.max_amount) {
                                if (datas.amount <= wallet_balance) {
                                    let d = new Date(),
                                        remaining_days = (plan_data.total_weeks) * 7,
                                        endDate = d.setDate(d.getDate() + remaining_days);
                                    let stack_details = {
                                        userId: user_data._id,
                                        plan: plan_data._id,
                                        currency: plan_data.currency,
                                        amount: parseFloat(datas.amount),
                                        return_percentage: plan_data.return_percentage,
                                        return_amount: apr_amount,
                                        weekly_percentage: parseFloat(plan_data.weekly_percentage),
                                        daily_percentage: parseFloat(plan_data.weekly_percentage / 7),
                                        daily_rewards: daily_rewards,
                                        total_weeks: plan_data.total_weeks,
                                        remaining_days: remaining_days,
                                        start_date: Date.now(),
                                        end_date: endDate,
                                    }
                                    stackDB.create(stack_details, (err, created) => {
                                        if (!err && created) {
                                            let remaining_balance = wallet_balance - datas.amount;
                                            stackwalletDB.updateOne({ "userId": user_id, "wallet.currency": currency }, {
                                                "$set": {
                                                    "wallet.$.amount": remaining_balance
                                                }
                                            }, (err, updated) => {
                                                if (!err && updated) {
                                                    let count = 0;
                                                    let history = [];
                                                    for (let i = 0; i < created.remaining_days; i++) {
                                                        let date = new Date();
                                                        date.setDate(date.getDate() + i)
                                                        let obj = {
                                                            userId: user_data._id,
                                                            stackId: created._id,
                                                            plan: datas.plan,
                                                            currency: datas.currency,
                                                            day: "day " + (i + 1),
                                                            amount: datas.amount,
                                                            daily_percentage: plan_data.daily_percentage,
                                                            date: date,
                                                        }
                                                        history.push(obj);
                                                        count++;
                                                        if (count == created.remaining_days) {
                                                            let input = {
                                                                "userId": user_data._id,
                                                                "stackId": created._id,
                                                                "history": history
                                                            }
                                                            stakeHistoryDB.create(input, (err, historycreated) => {
                                                                if (!err && historycreated) {
                                                                    if (user_data.referrer != null) {
                                                                        refCommission = await commission.findOne({})
                                                                        ref_commission = stack_fee - (refCommission.stack_percentage / 100);
                                                                        referrar_wallet = await wallet.findOne({ 'userId': user_data.referrer, 'wallet.currency': currency }, { 'wallet.$': 1 })
                                                                        console.log(referrar_wallet, "referrar_wallet")
                                                                        wallet.updateOne({ 'userId': user_data.referrer, 'wallet.currency': currency }, {
                                                                            $set: {
                                                                                "wallet.$.amount": referrar_wallet.wallet[0].amount + ref_commission
                                                                            }
                                                                        }, (err, updated) => {
                                                                            if (!err && updated) {
                                                                                res.json({ "status": true, "message": "stacking added successfully" })
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({ "status": true, "message": "stacking added successfully" })
                                                                    }
                                                                } else {
                                                                    res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
                                                                }
                                                            })
                                                        }
                                                    }
                                                } else {
                                                    res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
                                                }
                                            })
                                        } else {
                                            res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
                                        }
                                    })
                                } else {
                                    res.json({ "status": false, "message": "Insufficient Balance" })
                                }
                            } else {
                                res.json({ "status": false, "message": `Amount must be ${plan_data.min_amount} to ${plan_data.max_amount}` })
                            }
                        } else {
                            res.json({ "status": false, "message": "Wallet does not exists" })
                        }
                    })
                } else {
                    res.json({ "status": false, "message": "Plan does not exist" })
                }
            })
        } else {
            res.json({ "status": false, "message": "User Doesn't exist" })
        }
    })
})

router.post('/api/v1/user/stakeHistory', auth.isauthenticated, (req, res) => {
    try {
        let userId = mongoose.Types.ObjectId(req.user_id);
        userDB.findOne({ "_id": userId }, (err, getuser) => {
            if (!err && getuser != null) {
                let data = req.body;//stakeId
                stakeHistoryDB.findOne({ "userId": userId, "stakeId": data.stakeId }, (err, stakehistory) => {
                    if (!err && stakehistory != null) {
                        res.json({ "status": false, "message": "success", "data": stakehistory })
                    } else {
                        res.json({ "status": false, "message": "success", "data": {} })
                    }
                })
            } else {
                res.json({ "status": false, "message": "User doesn't exist" })
            }
        })
    } catch (err) {
        console.log("Error catched in stake history", err);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
})

module.exports = router;