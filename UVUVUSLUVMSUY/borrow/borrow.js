const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../../helper/auth');

const borrowPairDB = require('../../model/borrow-pair');
const borrowDB = require('../../model/borrow');
const borrowWalletDB = require('../../model/borrow-wallet');
const borrowRepayDB = require('../../model/borrow-repay');
const userDB = require('../../model/user');

router.get('/api/v1/user/borrow', auth.isauthenticated, (req, res) => {
    try {
        let datas = req.body
        let user_id = mongoose.Types.ObjectId(req.user_id);
        userDB.findOne({ "_id": user_id }, (err, user_data) => {
            if (!err && user_data != null) {
                borrowPairDB.findOne({ 'borrow_currency': datas.borrow_currency, 'collateral_currency': datas.collateral_currency, 'loan_term': datas.loan_term }, (err, borrow_data) => {
                    if (!err && borrow_data != null) {
                        borrowWalletDB.findOne({ 'userId': user_id, 'wallet.currency': datas.collateral_currency }, { 'wallet.$': 1, 'userId': 1 }, (err, wallet_data) => {
                            if (!err && wallet_data != null) {
                                var checkBalance = wallet_data.wallet[0].amount;
                                var collateral_amount = datas.borrow_amount * borrow_data.collateral_value;
                                if (datas.borrow_amount < checkBalance) {
                                    let borrow_details = {
                                        'userId': user_id,
                                        'borrow_currency': datas.borrow_currency,
                                        'collateral_currency': datas.collateral_currency,
                                        'borrow_amount': parseFloat(datas.borrow_amount),
                                        'collateral_amount': collateral_amount,
                                        'daily_interest_rate': borrow_data.daily_interest_rate,
                                        'hourly_interest_rate': borrow_data.hourly_interest_rate,
                                        'loan_term': borrow_data.loan_term,
                                        'repayment_days': borrow_data.repayment_days,
                                    }
                                    borrowDB.create(borrow_details, (err, new_borrow) => {
                                        if (!err && new_borrow) {
                                            borrowWalletDB.updateOne({ 'userId': user_id, 'wallet.currency': datas.collateral_currency.toLowerCase() }, {
                                                $set: {
                                                    "wallet.$.amount": wallet_data.wallet[0].amount - datas.collateral_amount,
                                                }
                                            }, (err, coll_updated) => {
                                                if (!err && coll_updated) {
                                                    borrowWalletDB.findOne({ 'userId': user_id, 'wallet.currency': datas.borrow_currency }, { 'wallet.$': 1 }, (err, user_borrow_wallet) => {
                                                        if (!err && user_borrow_wallet) {
                                                            borrowWalletDB.updateOne({ 'userId': user_id, 'wallet.currency': datas.borrow_currency }, {
                                                                $set: {
                                                                    "wallet.$.amount": user_borrow_wallet.wallet[0].amount + datas.borrow_amount
                                                                }
                                                            }, (err, brw_updated) => {
                                                                if (!err && brw_updated) {
                                                                    if (user_data.referrer != null) {
                                                                        refCommission = await commission.findOne({})
                                                                        ref_commission = borrow_data.borrow_fee - (commission.borrow_percentage / 100);
                                                                        referrar_wallet = await wallet.findOne({ 'userId': user_data.referrer, 'wallet.currency': currency }, { 'wallet.$': 1 })
                                                                        console.log(referrar_wallet, "referrar_wallet")
                                                                        wallet.updateOne({ 'userId': user_data.referrer, 'wallet.currency': currency }, {
                                                                            $set: {
                                                                                "wallet.$.amount": referrar_wallet.wallet[0].amount + ref_commission
                                                                            }
                                                                        }, (err, updated) => {
                                                                            if (!err && updated) {
                                                                                res.json({ "status": true, "message": "borrow success", "data": new_borrow })
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({ "status": true, "message": "borrow success", "data": new_borrow })
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.json({ "status": false, "message": "Insufficient balance" })
                                }
                            } else {
                                res.json({ "status": false, "message": "given currency value does not exists in wallet!" })
                            }
                        })
                    } else {
                        res.json({ "status": false, "message": "borrow pair does not exists!" })
                    }
                })
            }
            else {
                res.json({ "status": false, "message": "user does not exists!" })
            }
        })
    } catch (err) {
        console.log("Error catched in stake plans", err);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
})

router.get('/api/v1/user/borrowRepayment', auth.isauthenticated, (req, res) => {
    try {
        var datas = req.body
        let user_id = mongoose.Types.ObjectId(req.user_id);
        borrowDB.findOne({ '_id': datas.borrow_id }, (err, borrow_data) => {
            if (!err && borrow_data != null) {
                borrowWalletDB.findOne({ 'userId': user_id, 'wallet.currency': borrow_data.borrow_currency }, { 'wallet.$': 1, 'userId': 1 }, (err, user_borrow_wallet) => {
                    if (!err && user_borrow_wallet != null) {
                        borrowWalletDB.findOne({ 'userId': user_id, 'wallet.currency': borrow_data.collateral_currency }, (err, user_collateral_wallet) => {
                            if (!err && user_collateral_wallet != null) {
                                var checkBalance = wallet_data.wallet[0].amount;
                                var collateral_amount = datas.repay_amount * borrow_data.collateral_amount;
                                var oneDayInterest = ((borrow_data.borrow_amount) * (borrow_data.daily_interest_rate)) / 100;
                                var totalInterest = oneDayInterest * borrow_data.completed_days;
                                var repay_amount = borrow_data.borrow_amount + totalInterest;
                                if (repay_amount < checkBalance) {
                                    if (repay_amount < collateral_amount) {
                                        let repayment_details = {
                                            'userId': user_id,
                                            'borrowId': borrow_data._id,
                                            'repay_currency': borrow_data.borrow_currency,
                                            'repay_amount': parseFloat(datas.repay_amount),
                                        }
                                        borrowRepayDB.create(repayment_details, (err, borrow_repay_history) => {
                                            if (!err && borrow_repay_history) {
                                                borrowDB.updateOne({ '_id': datas.borrow_id }, {
                                                    $set: {
                                                        status: false,
                                                    }
                                                }, (err, updated) => {
                                                    if (!err && updated) {
                                                        res.json({ "status": true, "message": "repayment successful!" })
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        res.json({ "status": false, code: 400, "message": `your repay amount limit is ${user_borrow_wallet.wallet[0].amount}` })
                                    }
                                } else {
                                    res.json({ "status": false, "message": "Insufficient balance" })
                                }
                            }
                        })
                    }
                })
            }
        })
    }
    catch (err) {
        console.log("Error catched in stake plans", err);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
})

router.post('/api/v1/user/borrowHistory', auth.isauthenticated, (req, res) => {
    try {
        let userId = mongoose.Types.ObjectId(req.user_id);
        userDB.findOne({ "_id": userId }, (err, getuser) => {
            if (!err && getuser != null) {
                let data = req.body;
                borrowDB.find({ "userId": userId }, (err, borrowhistory) => {
                    if (!err && borrowhistory != null) {
                        res.json({ "status": true, "message": "success", "data": borrowhistory })
                    } else {
                        res.json({ "status": false, "message": "no borrow history", "data": {} })
                    }
                })
            } else {
                res.json({ "status": false, "message": "User doesn't exist" })
            }
        })
    } catch (err) {
        console.log("Error catched in borrow history", err);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
})

module.exports = router;