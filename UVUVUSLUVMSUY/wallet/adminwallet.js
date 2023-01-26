const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../../helper/auth');
const Encrypter = require('../../helper/encrypter');

const walletTransferDB = require('../../model/wallet-transfer-history');

router.post('/api/v1/admin/wallet/getWalletTransfer',auth.verify_origin,
auth.isAdmin, auth.isauthenticated, (req, res)=>{
    try{
        let userId = mongoose.Types.ObjectId(req.user_id);
        walletTransferDB.aggregate([
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
                    "fromWallet":"$fromWallet",
                    "toWallet":"$toWallet",
                    "amount":"$amount",
                    "fee":"$fee",
                    "feePercent":"$feePercent",
                    "receiveAmount":"$receiveAmount",
                    "currencySymbol":"$currencySymbol",
                    "dateTime":"$dateTime",
                    "email":{"$arrayElemAt":["$userdata.email", 0]}
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
                        res.json({"status":false, "message":"success", "data":results})
                    }
                }
            }else{
                res.json({"status":true, "message":"success", "data":[]})
            }
        })
    }catch(err){
        console.log("Error catched in get wallet transfer", err);
        res.json({"status":false, "message":"Oops! Something went wrong. Please try again later"})
    }
})

module.exports = router;