var WAValidator = require('multicoin-address-validator'),
    RippleAPI = require('ripple-lib').RippleAPI,
    TronWeb = require('tronweb');
	
	var api = new RippleAPI({
		server: 'wss://s.altnet.rippletest.net:51233', 
	});


var TronHttpProvider = TronWeb.providers.HttpProvider;
var fullNode = new TronHttpProvider('https://api.shasta.trongrid.io'),
	solidityNode = new TronHttpProvider('https://api.shasta.trongrid.io'),
	eventServer = 'https://api.shasta.trongrid.io';
var tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

module.exports.validate_coin_address = async (req, res, next) => {
	var address = req.body.address, currency = req.body.currency.toLowerCase();
	if (address == undefined || address == null || address == '')
		res.status(201).send({ status: false, code: 400, message: "Address is required" })
	else if (currency == undefined || currency == null || currency == '')
		res.status(201).send({ status: false, code: 400, message: "Currency is required" })
	else if(currency == 'xrp'){
			var connect = await api.connect()
			api.request('account_info', {account:address}).then(account=>{
				api.disconnect()
				next()
			}).catch(error=>{
				api.disconnect()
				res.send({status:false, code:400, message:`Invalid ${currency.toUpperCase()} address`});
			})
	}else {
		if (currency == 'btc' || currency == 'eth' || currency == 'usdt') {
			var valid = WAValidator.validate(address, currency, 'testnet');
			if (!valid)
				res.status(201).send({ status: false, code: 201, message: `Invalid ${currency.toUpperCase()} address` })
			else
				next()
		} else if (currency == 'bnb') {

			next()
		} else if (currency == 'trx') {
			var valid = tronWeb.isAddress(address)
			if (!valid)
				res.status(201).send({ status: false, code: 201, message: `Invalid ${currency.toUpperCase()} address` })
			else
				next()
		}
	}
}