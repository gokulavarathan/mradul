var bitcoin_rpc = require('node-bitcoin-rpc'),
	rpc = require('node-json-rpc2'),
	Client = require('node-rest-client').Client,
	RippleAPI = require('ripple-lib').RippleAPI,
	converter = require('hex2dec'),
	request = require('request'),
	TronWeb	= require('tronweb'),
	client = new Client();

// XRP
var api = new RippleAPI({
	//server: 'wss://s1.ripple.com', 
     server: 'wss://s.altnet.rippletest.net:51233' 
});



var TronHttpProvider  = TronWeb.providers.HttpProvider;
var fullNode      = new TronHttpProvider('https://api.trongrid.io'),
	solidityNode  = new TronHttpProvider('https://api.trongrid.io'),
	eventServer   = 'https://api.trongrid.io';
var tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

var Address = require('../model/address'),
	Currency = require('../model/currency'),	
	Transfer = require('../model/crypto'),
	adminWithdraw = require('../model/admin-transfer');

var _bitcoin = require('../QRklHLVNFRFWE/QlRDLUNSWVBUTw'),
 	_ether = require('../QRklHLVNFRFWE/RVRILUNSWVBUTw'),
 	_tron = require('../QRklHLVNFRFWE/VFJYLUNSWVBUTw'),
 	_binance = require('../QRklHLVNFRFWE/QkCLUNSWVBUTw'),
 	_token = require('../QRklHLVNFRFWE/VVNEVCDUllQVE'),
	_ripple = require('../QRklHLVNFRFWE/XRPGHxvganDf'),
	_tronusdt = require('../QRklHLVNFRFWE/TRoenBAbnvnkinhKl'),
	Helper = require('./helper'),
	Request = require('./2fa');

module.exports.generate = async(userId, coin, cb)=>{
    if(coin == "btc"){
		var host = _bitcoin[coin].host.slice(1, -1), user = _bitcoin[coin].user.slice(1, -1), pass = _bitcoin[coin].password.slice(1, -1), port = _bitcoin[coin].port;
		// console.log('btc host',host)
		// console.log('btc user',user)
		// console.log('btc pass',pass)
		// console.log('btc port',port)
		var rpcclient = new rpc.Client({host:host, port:parseFloat(port), user:user, pass:pass});
		//console.log('btc rpcclient',rpcclient)
		rpcclient.call({method:'getnewaddress', id:'0', jsonrpc:'2.0'}, (err, result)=>{
			//console.log('btc result',result)
		if(result){
			var data = {userId:userId, address:result.result, currency:coin, date:new Date()};
			Address.create(data, (err, created)=>{
				//console.log('btc created',created)

			if(created)
				cb({status:true, address:created.address, currency:created.currency});
			else
				cb({status:false});	
			})
		}else
			cb({status:false});	
		})
	}else if(coin == "eth"){
		
		var host = _ether[coin].host, port = _ether[coin].port;
	    var url = 'http://'+host+':'+port;
	    var args = {
		
			data:{ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [_ether[coin].user], "id": 1 },
			headers: { "Content-Type": "application/json;charset=utf-8" }
		};
		console.log('url',url)
		console.log('args',args)
		client.post(url, args, (new_acc, rep_eth_address)=>{
			console.log('new_acc',new_acc)
		if(new_acc){ 
			var data = [{userId:userId, address:new_acc.result, currency:'eth', date:new Date()}, {userId:userId, address:new_acc.result, currency:'usdt', date:new Date()}];
			Address.create(data, (err, created)=>{
			if(created)
				cb({status:true, address:created[0].address, currency:'eth'});
			else
				cb({status:false});	
			})
		}else
			cb({status:false})	
		})
	}else if(coin == "trx"||coin == "trxusdt"){
		var newAddress = await tronWeb.createAccount();

		console.log('newAddress---->',newAddress)
		
		console.log('trxusdt data---->',data)
		if(coin == "trxusdt"){
			var data = {userId:userId, currency:"trxusdt", secret:newAddress.privateKey, public:newAddress.publicKey, address:newAddress.address.base58,date:new Date()};
		}else{
			var data = {userId:userId, currency:"trx", secret:newAddress.privateKey, public:newAddress.publicKey, address:newAddress.address.base58,date:new Date()};
		}
	
		Address.create(data, (err, created)=>{
			console.log('created---->',created)
		if(created)	
			cb({status:true, address:created.address, currency:created.currency})
		else
			cb({status:false})
		})
		
	}else if(coin == "bnb"){
		var random = await Helper.memo()
		var address = _binance['bnb'].address.slice(1, -1), tag = 'BNB'+random;
		var data = {userId:userId, address:address, tag:tag, currency:'bnb'};
		Address.create(data, (err, created)=>{
		if(err)
			cb({status:false})	
		else
			cb({status:true, address:created.address, currency:created.currency, tag:created.tag})
		})
	}
	else if(coin == "xrp"){
		//var data = [{email:userEmail, userId:userId, address:config[coin].address.slice(1, -1), currency:currency, date:new Date(), tag:Helper.tag()}];
		 var random = await Helper.tag()
		 var address = _ripple['xrp'].address.slice(1, -1), tag = 'XRP'+random;
		 var data = {userId:userId, address:address, tag:tag, currency:'xrp'};
		Address.create(data, (err, created)=>{
		if(created)
			cb({status:true, address:created[0].address, currency:created.currency, tag:created.tag});
		else
			cb({status:false});	
		})
	}else{
		cb({status:false})
	}
}

module.exports._get_balance = async(coin, address, cb)=>{
	if(coin == "btc"){
		var host = _bitcoin[coin].host.slice(1, -1), user = _bitcoin[coin].user.slice(1, -1), pass = _bitcoin[coin].password.slice(1, -1), port = _bitcoin[coin].port;
		var rpcclient = new rpc.Client({host:host, port:parseFloat(port), user:user, pass:pass});
		rpcclient.call({method:'getbalance', id:"0", jsonrpc:"2.0"}, (err, response) => {
		if(response)
			cb({status:true, data:response})
		else
			cb({status:false})
		})
	}else if(coin == "eth"){
		var host = _ether[coin].host.slice(1, -1), port = _ether[coin].port, adminAddress = _ether[coin].address.slice(1, -1);
		// var url = 'http://'+host+':'+port;
		var url = 'http://'+_ether[coin].host+':'+_ether[coin].port;
	    var args = {
			// data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[adminAddress, "latest"], "id": 1 },
			// data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[_ether[coin].address, "latest"], "id": 1 },
			data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[address, "latest"], "id": 1 },
	        headers: { "Content-Type": "application/json;charset=utf-8" }
	    };      
	    client.post(url, args, function (resData) {  
			// console.log("url", url, "args", args, "resdddddd", resData)
	    if(resData.result){
			var eth_balance = converter.hexToDec(resData.result);
			var result = eth_balance / 1000000000000000000;
			// console.log("Resulttttttttttt", result)
			cb({status:true, data:{result:result}})
		}else
			cb({status:false})
		})
	}else if(coin == "usdt"){
		var coin_data = await Currency.findOne({symbol:'usdt'}).exec();
		var options = {
			url:"https://api.etherscan.io/api",
			method:"GET",
			headers:{ "Content-Type":"application/json" },
			qs:{ "module":"account", "action":"tokenbalance", "contractaddress":coin_data.contract_address, "address":address, "tag":"latest", "apikey":"RK6KUYR4WDK9MKCU2WFMQV3XEAKCW95UTQ" }
		};

		request(options, (error, options, body)=>{
		if(body){
			var data = JSON.parse(body);
			if(data.status == "1"){
				var amount = (parseFloat(data.result) / Math.pow(10, coin_data.decimal));
				cb({status:true, data:{result:amount}})
			}
			else
				cb({status:false})
		}else
			cb({status:false})
		})
	}else if(coin == "trx"){
		var account = await tronWeb.trx.getAccount(address)
		if(account.balance !== undefined && account.balance !== null && account.balance !== '')
			cb({status:true, data:{result:(account.balance/1000000)}})
		else
			cb({status:false})
	}
	else if(coin == "trxusdt"){
		var account = await tronWeb.trxusdt.getAccount(address)
		if(account.balance !== undefined && account.balance !== null && account.balance !== '')
			cb({status:true, data:{result:(account.balance/1000000)}})
		else
			cb({status:false})
	}else if(coin == "bnb"){
		var options = {
			url:`https://dex.binance.org/api/v1/account/${address}`,
			method:'GET',
			headers:{"Content-Type":"application/json"}	
		}
		request(options, (error, response, body)=>{
		if(body){
			var data = JSON.parse(body);
			var result = data.balances.find(e=>{ return e.symbol == "BNB" });
			if(result)
				cb({status:true, data:{result:parseFloat(result.free)}})
			else
				cb({status:false})
		}else
			cb({status:false})	
		})
		
	}
	else if(coin == 'xrp'){
		var connect = await api.connect()
		api.getBalances(address).then(result=>{
			api.disconnect()
			cb({status:true, data:{result:parseFloat(result[0].value)}})
		}).catch(error=>{
			api.disconnect()
			cb({status:false})
		})
	}else{
		cb({status:false})
	}
}

module.exports.deposit = async(details, cb)=>{
	var coin = details.currency.toLowerCase();
	if(coin == "btc"){
		var host = _bitcoin[coin].host.slice(1, -1), port = _bitcoin[coin].port, user = _bitcoin[coin].user.slice(1, -1), pass = _bitcoin[coin].password.slice(1, -1);
		bitcoin_rpc.init(host, port, user, pass);
	    bitcoin_rpc.call('walletpassphrase', ["Suren@123",120], function (err1, value) {
		if(value){
			bitcoin_rpc.call('sendtoaddress', [details.address, +details.amount], function (berr, success) {
			if (berr)
				cb({status:false, "msg":berr});
			else{
				bitcoin_rpc.call('gettransaction', [success.result], function(err, response){
				if(response){
					cb({status:true, hash:success.result, fee:Math.abs(response.fee)})
				}else	
					cb({status:true, hash:success.result})
				})
			}
			});
		}
		})
	}else if(coin == "eth"){
		// var host = _ether[coin].host.slice(1, -1), port = _ether[coin].port, Admin_address = _ether[coin].address.slice(1, -1), Admin_key = _ether[coin].admin.slice(1, -1);
		var host = _ether[coin].host, port = _ether[coin].port, Admin_address = _ether[coin].address.slice(1, -1), Admin_key = _ether[coin].user;
		console.log("host", host, "port", port, "admin address", Admin_address, "key", Admin_key)
		var url = 'http://'+host+':'+port;
	    var args = { data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[Admin_address, "latest"], "id": 1 }, headers: { "Content-Type": "application/json;charset=utf-8" }};      
		client.post(url, args, function (resData) {   
	    if(resData){
	    	Request._gas_price((gasprice)=>{
				var eth_balance = converter.hexToDec(resData.result), 
					transAmount = details.amount * 1000000000000000000, 
					gasPrice = parseFloat(gasprice.SafeGasPrice) * 1000000000, 
					gasLimit = '21000';
				var fees = ((gasPrice * 21000)/1000000000000000000)
				gasPrice = converter.decToHex(gasPrice+'');     
				gasLimit = converter.decToHex(gasLimit);           
				var amount = converter.decToHex(transAmount+'');    
				var unlock = {data:{"jsonrpc":"2.0", "method":"personal_unlockAccount", "params":[Admin_address, Admin_key, null], "id": 1 }, headers:{"Content-Type":"application/json;charset=utf-8" }};                
				client.post(url, unlock, function (unlockData) {           
				if(unlockData.result) {
					// var deposit = {data: { "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [{"from":details.address, "to": Admin_address,"gas": gasLimit ,"gasPrice": gasPrice,"value": details.amount }], "id": 22 },headers: { "Content-Type": "application/json;charset=utf-8" }};
					var deposit = {data: { "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [{"from":Admin_address, "to": details.address,"gas": gasLimit ,"gasPrice": gasPrice,"value": amount }], "id": 22 },headers: { "Content-Type": "application/json;charset=utf-8" }};
		            client.post(url, deposit, function (outData) {               
		            if(outData.result){
		            	cb({status:true, hash:outData.result, fee:fees})
		            }else
				    	cb({status:false, data:outData})
		        	})
				}else
			    	cb({status:false, data:unlockData})
				})
			})
	    }else{
	    	cb({status:false, data:resData})
	    }
		})
	}else if(coin == "bnb"){
		var addressTo = details.address, 
			fromAddress= _binance['bnb'].address,
			secret = _binance['bnb'].secret,
			amount = details.amount,
			memo = details.tag;
		bnbClient.setPrivateKey(secret);
		sequenceURL = 'https://dex.binance.org/api/v1/account/'+fromAddress+'/sequence';
		request(sequenceURL, async(error, repsonse, body)=>{
		if(body){		
			var data = JSON.parse(body)
			var sequence = data.sequence || 0;
	        var result = await bnbClient.transfer(fromAddress, addressTo, amount, "BNB", memo, sequence)
	        if(result)
	        	cb({status:true, hash:result.result[0].hash, fee:0.000075})
	        else 
	        	cb({status:false})
	    }else
	    	cb({status:false, msg:error})    
		})
	}else if(coin == "trx"){
		var toAddress = details.address,
			Amount = details.amount * Math.pow(10, 6),
			fromAddress = _tron['trx'].address.slice(1, -1),
			privateKey = _tron['trx'].secret.slice(1, -1);

		var tradeobj = await tronWeb.transactionBuilder.sendTrx(toAddress, Amount, fromAddress, 1);
		var signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
		var receipt = await tronWeb.trx.sendRawTransaction(signedtxn);
		if(receipt.result){
			var transaction_id= receipt.transaction.txID; // hash receipt.transaction.txID or receipt.txid
			var transaction_info = await tronWeb.trx.getTransactionInfo(transaction_id);
			if(transaction_info)
				cb({status:true, hash:transaction_id})
			else{
				var tx_fee = (transaction_info.fee / 10000000000)
				cb({status:true, hash:transaction_id, fee:tx_fee})
			}
		}else{
			cb({status:false})
		}
	}
	else if(coin == "trxusdt"){
		var toAddress = details.address,
			Amount = details.amount * Math.pow(10, 6),
			fromAddress = _tronusdt['trxusdt'].address.slice(1, -1),
			privateKey = _tronusdt['trxusdt'].secret.slice(1, -1);

		var tradeobj = await tronWeb.transactionBuilder.sendTrx(toAddress, Amount, fromAddress, 1);
		var signedtxn = await tronWeb.trxusdt.sign(tradeobj, privateKey);
		var receipt = await tronWeb.trxusdt.sendRawTransaction(signedtxn);
		if(receipt.result){
			var transaction_id= receipt.transaction.txID; // hash receipt.transaction.txID or receipt.txid
			var transaction_info = await tronWeb.trxusdt.getTransactionInfo(transaction_id);
			if(transaction_info)
				cb({status:true, hash:transaction_id})
			else{
				var tx_fee = (transaction_info.fee / 10000000000)
				cb({status:true, hash:transaction_id, fee:tx_fee})
			}
		}else{
			cb({status:false})
		}
	}else if(coin == "usdt"){
		var coin_data = await Currency.findOne({symbol:coin}).exec();
		var host = _ether['eth'].host.slice(1, -1);
		var port = _ether['eth'].port;
		var Admin_address = _ether['eth'].address.slice(1, -1);
		var Admin_key = _ether['eth'].admin.slice(1, -1);
		var url = 'http://'+host+':'+port;
	    var args = {
	        data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[Admin_address, "latest"], "id": 1 },
	        headers: { "Content-Type": "application/json;charset=utf-8" }
	    };      

	    client.post(url, args, function (resData) {        
	    if(resData){
	    	Request._gas_price((gasprice)=>{
				var eth_balance = converter.hexToDec(resData.result)
				if(eth_balance > 100000000000){
					var unlock = {
						data:{"jsonrpc":"2.0", "method":"personal_unlockAccount", "params":[Admin_address, Admin_key, null], "id": 1 },
						headers:{"Content-Type":"application/json;charset=utf-8" }
					};                
					client.post(url, unlock, function (unlockData) {                   
					if(unlockData.result) {
			        	var transAmount = Amount * 1000000000000000000, 
			        		gasPrice = parseFloat(gasprice.SafeGasPrice) * 1000000000, 
			        		gasLimit = '100000',
			        		contract_address = coin_data.contract_address;
						var fees = ((gasPrice * 100000)/1000000000000000000)
			        	var FeeCal = gasPrice;
		                gasPrice = converter.decToHex(gasPrice);
		                gasLimit = converter.decToHex(gasLimit);
	                	var tokenAmt = details.amount;
		                var decimal = '1'.padEnd(coin_data.decimal+1, 0);
		                tokenAmt = tokenAmt * +decimal;
	                	var hexAmount = tokenAmt.decToHex(tokenAmt+'').substr(2).padStart(64, '0');
	                	var hexAcc = receiver.substr(2);
	                	var input = '0xa9059cbb000000000000000000000000'+hexAcc+hexAmount; // met+userAdd+amt
		                var deposit = {
			                data:{ "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [{"from":Admin_address ,"to": contract_address,"gas": gasLimit ,"gasPrice": gasPrice,"data": input }], "id": 22 },
		   	            	headers: { "Content-Type": "application/json;charset=utf-8" }
		                };

		                client.post(url, deposit, (outData)=>{
		                if(outData.result){	
			              	cb(null, {hash:outData.result, fee:fees})
		  	            }
		  	            else
		                	cb(outData,  null)
		                })
					}else
						cb(unlockData, null)
					})
				}else
					cb({msg:'Insufficient Gas Price'}, null)
	    	})
	    }else
	    	cb(resData, null)
		})
	}else{
		cb({status:false}, null)
	}
}

module.exports.transfer_admin = async(details, cb)=>{
	var coin = details.currency.toLowerCase(),
		sender = details.address,
		fund = details.amount;
 	if(coin == "eth"){
		var host = _ether[coin].host.slice(1, -1), port = _ether[coin].port, Admin_address = _ether[coin].address.slice(1, -1), User_key = _ether[coin].user.slice(1, -1);
		var url = 'http://'+host+':'+port;
	    var args = { data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[sender, "latest"], "id": 1 }, headers: { "Content-Type": "application/json;charset=utf-8" }};      
	    client.post(url, args, function (resData) {        
	    if(resData){
	    	Request._gas_price((gasprice)=>{
				var eth_balance = converter.hexToDec(resData.result), 
					gasPrice = parseFloat(gasprice.SafeGasPrice) * 1000000000, 
					gasLimit = '21000';

				var fees = ((gasPrice * 21000)/1000000000000000000);

				var transAmount = eth_balance - (gasPrice*21000), 
				gasPrice = converter.decToHex(gasPrice+'');     
				gasLimit = converter.decToHex(gasLimit);           
				var amount = converter.decToHex(transAmount+'');      
				var unlock = {data:{"jsonrpc":"2.0", "method":"personal_unlockAccount", "params":[sender, User_key, null], "id": 1 }, headers:{"Content-Type":"application/json;charset=utf-8" }};                
				client.post(url, unlock, function (unlockData) {                   
				if(unlockData.result) {
		            var deposit = {data: { "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [{"from":sender, "to": Admin_address,"gas": gasLimit ,"gasPrice": gasPrice,"value": amount }], "id": 22 },headers: { "Content-Type": "application/json;charset=utf-8" }};
		            client.post(url, deposit, function (outData) {                  
		            if(outData.result){
		            	cb({status:true, hash:outData.result, fee:fees})
		            }else
				    	cb({status:false})
		        	})
				}else
			    	cb({status:false})
				})
			})
	    }else{
	    	cb({status:false})
	    }
		})
	}else if(coin == "trx"){
		var address_data = await Address.findOne({address:sender, currency:'trx'}).exec();
		var toAddress = _tron['trx'].address.slice(1, -1),
			fromAddress = sender,
			privateKey = address_data.secret;

		this._get_balance(sender, 'trx', async(balance)=>{
		if(balance.status){
			Amount = balance.data['result'] * Math.pow(10, 6);
			var tradeobj = await tronWeb.transactionBuilder.sendTrx(toAddress, Amount, fromAddress, 1);
			var signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
			var receipt = await tronWeb.trx.sendRawTransaction(signedtxn);
			if(receipt.result){
				var transaction_id= receipt.transaction.txID; // hash receipt.transaction.txID or receipt.txid
				var transaction_info = await tronWeb.trx.getTransactionInfo(transaction_id);
				if(transaction_info)
					cb({status:true, hash:transaction_id})
				else{
					var tx_fee = (transaction_info.fee / 10000000000)
					cb({status:true, hash:transaction_id, fee:tx_fee})
				}
			}else{
				cb({status:false})
			}
		}else
			cb({status:false})
		})
	}
	else if(coin == "trxusdt"){
		var address_data = await Address.findOne({address:sender, currency:'trxusdt'}).exec();
		var toAddress = _tronusdt['trxusdt'].address.slice(1, -1),
			fromAddress = sender,
			privateKey = address_data.secret;

		this._get_balance(sender, 'trxusdt', async(balance)=>{
		if(balance.status){
			Amount = balance.data['result'] * Math.pow(10, 6);
			var tradeobj = await tronWeb.transactionBuilder.sendTrx(toAddress, Amount, fromAddress, 1);
			var signedtxn = await tronWeb.trxusdt.sign(tradeobj, privateKey);
			var receipt = await tronWeb.trxusdt.sendRawTransaction(signedtxn);
			if(receipt.result){
				var transaction_id= receipt.transaction.txID; // hash receipt.transaction.txID or receipt.txid
				var transaction_info = await tronWeb.trxusdt.getTransactionInfo(transaction_id);
				if(transaction_info)
					cb({status:true, hash:transaction_id})
				else{
					var tx_fee = (transaction_info.fee / 10000000000)
					cb({status:true, hash:transaction_id, fee:tx_fee})
				}
			}else{
				cb({status:false})
			}
		}else
			cb({status:false})
		})
	}else if(coin == "usdt"){
		var coin_data = await Currency.findOne({symbol:coin}).exec();
		var host = _ether['eth'].host.slice(1, -1);
		var port = _ether['eth'].port;
		var Admin_address = _ether['eth'].address.slice(1, -1);
		var User_key = _ether['eth'].user.slice(1, -1);
		var url = 'http://'+host+':'+port;
	    var args = {
	        data: { "jsonrpc": "2.0", "method": "eth_getBalance", "params":[sender, "latest"], "id": 1 },
	        headers: { "Content-Type": "application/json;charset=utf-8" }
	    };      

	    client.post(url, args, function (resData) {        
	    if(resData){
	    	Request._gas_price((gasprice)=>{
				var eth_balance = converter.hexToDec(resData.result)
				var balance = eth_balance / 1000000000000000000; 
				if(eth_balance > 100000000000){
		        	var gasPrice = parseFloat(gasprice.SafeGasPrice) * 1000000000, 
		        		gasLimit = '100000',
		        		contract_address = coin_data.contract_address;
					var fees = ((gasPrice * 100000)/1000000000000000000)
		        	var FeeCal = gasPrice;
	                gasPrice = converter.decToHex(gasPrice);
	                gasLimit = converter.decToHex(gasLimit);
	                if(balance >= fees){
						var unlock = {
							data:{"jsonrpc":"2.0", "method":"personal_unlockAccount", "params":[sender, User_key, null], "id": 1 },
							headers:{"Content-Type":"application/json;charset=utf-8" }
						};
						client.post(url, unlock, function (unlockData) {                   
						if(unlockData.result) {

		                	var tokenAmt = fund;
			                var decimal = '1'.padEnd(coin_data.decimal+1, 0);
			                tokenAmt = tokenAmt * +decimal;
		                	var hexAmount = tokenAmt.decToHex(tokenAmt+'').substr(2).padStart(64, '0');
		                	var hexAcc = receiver.substr(2);
		                	var input = '0xa9059cbb000000000000000000000000'+hexAcc+hexAmount; // met+userAdd+amt
			                var deposit = {
				                data:{ "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [{"from":Admin_address ,"to": contract_address,"gas": gasLimit ,"gasPrice": gasPrice,"data": input }], "id": 22 },
			   	            	headers: { "Content-Type": "application/json;charset=utf-8" }
			                };

			                client.post(url, deposit, (outData)=>{
			                if(outData.result){	
				              	cb({status:true, hash:outData.result, fee:fees})
			  	            }
			  	            else
			                	cb({status:false, result:outData})
			                })
						}else
							cb({status:false, result:unlockData})
						})
					}else if(details.feeSent == true)
						cb({status:true, msg:"fee amount already sent"})
					else{
						var amount_to_sent = (feeData / 1000000000000000000)
						var transactions_data = {
							email: 'admin',
							currency:coin_data.symbol,
							ordertype:'withdraw',
							category:'user',
							type:'crypto',
							description:'AdminToUserETHTransfer',
							sendaddress:_ether['eth'].address.slice(1, -1),
							receiveaddress:response.receiveaddress,
							amount:amount_to_sent, 
							actualamount:amount_to_sent,
							confirmations:1,
							status:1, 
							fee:0, 
							mainFee:0, 
							date:new Date()
						};

						var details = {
							address:transactions_data.receiveaddress,
							amount:transactions_data.actualamount,
							currency:transactions_data.currency
						};
						this.deposit(details, async(result)=>{
						if(result.status){
							transactions_data.txnid = result.hash;
							transactions_data.mainFee = result.fee;
							var create_transfer = await adminWithdraw.create(transactions_data);
							var update_transfer = await Transfer.updateOne({_id:response._id}, {$set:{feeSent:true}}).exec()
							cb({status:false, message:"Fee amount sent"})
						}else
							cb({status:false, message:"Fee amount not sent"})
						})
					}
				}else
					cb({msg:'Insufficient Gas Price'}, null)
	    	})
	    }else
	    	cb(resData, null)
		})
	}else{
		cb({status:false}, null)
	}
}

module.exports.dat_file = (coin, cb)=>{
	cb({status:false, msg:400, code:"Invalid"})
}

module.exports.get_transaction_details = (cb)=>{
	var host = _ether[coin].host.slice(1, -1);
	var port = _ether[coin].port;
	var args = {
		data:{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83},
        headers: { "Content-Type": "application/json;charset=utf-8" }
    }
	var url = 'http://'+host+':'+port;
    client.post(url, args, function (resData) {        
    	resData.result = converter.hexToDec(resData.result)
    	cb(resData)
    })
}