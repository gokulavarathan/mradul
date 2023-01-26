var express = require('express'),
	router = express.Router();

var Helper = {
	Auth:require('../../helper/auth'),
	Validator:require('../../helper/validator')
}

var Middleware = {
	Crypto:require('../../UVSVklDRSFTElG/crypto/history'),
	Withdraw:require('../../UVSVklDRSFTElG/crypto/withdraw')
}

router.get(
	'/api/v1/crypto/list/:module',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Crypto.list
);

router.get(
	'/api/v1/crypto/view/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Crypto.view
);

router.get(
	'/api/v1/crypto/transaction-history/view/:id',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Crypto.view
);

router.get(
	'/api/v1/crypto/approve-deposit',
	Helper.Auth.verify_origin,
	Helper.Auth.verify_token,
	Helper.Auth.isAdmin,
	Helper.Auth.isauthenticated,
	Middleware.Crypto.view
);

router.get(
	'/api/v1/crypto-history', 
	Helper.Auth.verify_origin, 
	Helper.Auth.isauthenticated, 
	Middleware.Crypto._crypto_history
);

// router.get('/updateamount', (req, res)=>{
// 	var RippleAPI = require('ripple-lib').RippleAPI,
// 	Ripple = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' });
// 	let instructions = {
// 		maxLedgerVersionOffset:5
// 	}
// 	let sendAmount = parseFloat(parseFloat(10).toFixed(4));
// 	let amount = sendAmount.toString();
// 		var payment = {
// 			source:{
// 				address:'rfvELZs1MCH6HQ4wb1Hz43pF2Bu72dHEQ4',
// 				maxAmount:{
// 					value:amount,
// 					currency:'XRP'
// 				}
// 			},
// 			destination:{
// 				address:'rBG45oDYqXuzDgjdwsjHJTK8fkRepDBEhQ',
// 				amount:{
// 					value:amount,
// 					currency:'XRP'
// 				},
// 				tag:parseInt(22766134)
// 			}
// 		}
	
// 	Ripple.connect().then(function(){
// 		Ripple.preparePayment('rfvELZs1MCH6HQ4wb1Hz43pF2Bu72dHEQ4', payment, instructions).then(function(prepared){
// 			var signed = Ripple.sign(prepared.txJSON, 'ssB1GH1vKZUZjdN7iF5cid372uhGG');
// 			let transaction_id = signed.id;
// 			console.log("transactionid", transaction_id)
// 			Ripple.submit(signed.signedTransaction).then(function(submittrans){
				
// 			}).catch(function(err){
// 				console.log("Ripple submit error", err);
			
// 			})
// 		}).catch(function(err){
// 			console.log("Ripple prepare payment error", err);
			
// 		})
// 	}).catch(function(err){
// 		console.log("Ripple connection error", err);
		
// 	})


// })

router.get('/encryption', (req, res)=>{
	var DB_ENC = require('simple-encryptor')(process.env.ENCR_KEY_DB);
	console.log("host", DB_ENC.encrypt("192.168.1.75"));
	console.log("port", DB_ENC.encrypt("16879"));
	console.log("username", DB_ENC.encrypt("CdhCBbLKjcnzxDderdyPolfjBCE"));
	console.log("password", DB_ENC.encrypt("RfdcVBXhchdwedfuCkzxnxcmv"))
	console.log("dbname", DB_ENC.encrypt("HbcbFVXtchbbnjHDUwhdfiJNC"))
})

module.exports = router;