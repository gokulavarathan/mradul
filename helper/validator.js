var email_pattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

module.exports.register = (req, res, next)=>{
	if(req.body.email == undefined || req.body.email == null || req.body.email == '')
		res.status(201).send({status:false, code:400, message:'Email address is required'})
	else if(!email_pattern.test(req.body.email))
		res.status(201).send({status:false, code:400, message:'Invalid email address'})
	else if(req.body.password == undefined || req.body.password == null || req.body.password == '')
		res.status(201).send({status:false, code:400, message:'Password is required'})
	else if(req.body.password.length < 8 || req.body.password.length > 30)
		res.status(201).send({status:false, code:400, message:'Password should be 8-30 characters only'})
	else if(req.body.confirm_password == undefined || req.body.confirm_password == null || req.body.confirm_password == '')
		res.status(201).send({status:false, code:400, message:'Confirm password is required'})
	else if(req.body.password !== req.body.confirm_password)
		res.status(201).send({status:false, code:400, message:'Password mismatched'})
	else
		next()
};

module.exports.login = (req, res, next)=>{
 	if(req.body.username == undefined || req.body.username == null || req.body.username == '')
  	res.status(201).send({status:false, code:400, message:'Email address is required'})
	else if(!email_pattern.test(req.body.username))
  	res.status(201).send({status:false, code:400, message:'Invalid email address'})
	else if(req.body.password == undefined || req.body.password == null || req.body.password == '')
  	res.status(201).send({status:false, code:400, message:'Password is required'})
	else
  	next()
}

module.exports.reset_password = (req, res, next)=>{
	if(req.body.password == undefined || req.body.password == null || req.body.password == '')
		res.status(201).send({status:false, code:400, message:'Password is required'})
	else if(req.body.password.length < 8 || req.body.password.length > 30)
		res.status(201).send({status:false, code:400, message:'Password should be 8-30 characters only'})
	else if(req.body.confirm_password == undefined || req.body.confirm_password == null || req.body.confirm_password == '')
		res.status(201).send({status:false, code:400, message:'Confirm password is required'})
	else if(req.body.password !== req.body.confirm_password)
		res.status(201).send({status:false, code:400, message:'Password mismatched'})
	else
		next()
}

module.exports.forget_password = (req, res, next)=>{
 	if(req.body.email == undefined || req.body.email == null || req.body.email == '')
    	res.status(201).send({status:false, code:400, message:'Email address is required'})
  	else if(!email_pattern.test(req.body.email))
    	res.status(201).send({status:false, code:400, message:'Invalid email address'})
	else
		next()
}

module.exports.fiat_deposit = (req, res, next)=>{
  if(req.body.method == undefined || req.body.method == null || req.body.method == '')
    res.status(201).send({status:false, code:400, message:'Please select your transaction method'})
  else if(req.body.transactionid == undefined || req.body.transactionid == null || req.body.transactionid == '')
    res.status(201).send({status:false, code:400, message:'Transaction id is required'})
  else if(req.body.proof == undefined || req.body.proof == null || req.body.proof == '')
    res.status(201).send({status:false, code:400, message:'Transaction proof is required'})
  else if(req.body.amount == undefined || req.body.amount == null || req.body.amount == '')
    res.status(201).send({status:false, code:400, message:'Transaction amount is required'})
  else if(isNaN(req.body.amount))
    res.status(201).send({status:false, code:400, message:'Please enter a valid amount'})
  else if(req.body.currency == undefined || req.body.currency == null || req.body.currency == '')
    res.status(201).send({status:false, code:400, message:'Currency is required'})
  else
    next()
}

module.exports.fiat_withdraw = (req, res, next)=>{
  if(req.body.currency == undefined || req.body.currency == null || req.body.currency == '')
    res.status(201).send({status:false, code:400, message:'Currency is required'})
  else if(req.body.amount == undefined || req.body.amount == null || req.body.amount == '')
    res.status(201).send({status:false, code:400, message:'Withdraw amount is required'})
  else if(isNaN(req.body.amount))
    res.status(201).send({status:false, code:400, message:'Please enter a valid amount'})
  else if(req.body.description == undefined || req.body.description == null || req.body.description == '')
    res.status(201).send({status:false, code:400, message:'Notes is required'})
  else
    next()
}

module.exports.crypto_withdraw = (req, res, next)=>{
  if(req.body.currency == undefined || req.body.currency == null || req.body.currency == '')
    res.status(201).send({status:false, code:400, message:'Currency is required'})
  else if(req.body.amount == undefined || req.body.amount == null || req.body.amount == '')
    res.status(201).send({status:false, code:400, message:'Withdraw amount is required'})
  else if(isNaN(req.body.amount))
    res.status(201).send({status:false, code:400, message:'Transfer amount is required'})
  else if(req.body.address == undefined || req.body.address == null || req.body.address == '')
    res.status(201).send({status:false, code:400, message:'Receiver address is required'})
  else if(req.body.description == undefined || req.body.description == null || req.body.description == '')
    res.status(201).send({status:false, code:400, message:'Notes is required'})
  else if(req.body.currency.toLowerCase() == "bnb")	{
  	if(req.body.tag == undefined || req.body.tag == null || req.body.tag == ''){
	    res.status(201).send({status:false, code:400, message:'Notes is required'})
  	}
  }
  else
    next()
}

exports.spot_trade = (req, res, next)=>{
  var data = req.body;
  if(data.pair == undefined || data.pair == null || data.pair == '')
    res.status(201).send({status:false, code:400, message:"Trade pair is required"})
  else if(data.amount == undefined || data.amount == null || data.amount == '')
    res.status(201).send({status:false, code:400, message:"Amount is required"})
  else if(data.price == undefined || data.price == null || data.price == '')
    res.status(201).send({status:false, code:400, message:"Price is required"})
  else if(data.total == undefined || data.total == null || data.total == '')
    res.status(201).send({status:false, code:400, message:"Total is required"})
  else if(data.type == undefined || data.type == null || data.type == '')
    res.status(201).send({status:false, code:400, message:"Type is required"})
  else if(data.ordertype == undefined || data.ordertype == null || data.ordertype == '')
    res.status(201).send({status:false, code:400, message:"Side is required"})
  else if(['buy', 'sell'].indexOf(data.type.toLowerCase()) == -1)
    res.status(201).send({status:false, code:400, message:"Invalid Type"})  
  else if(['limit', 'market', 'stop', 'trigger'].indexOf(data.ordertype.toLowerCase()) == -1)
    res.status(201).send({status:false, code:400, message:"Invalid Side"})
  else if(isNaN(data.price))
    res.status(201).send({status:false, code:400, message:"Invalid price"})
  else if(isNaN(data.amount))
    res.status(201).send({status:false, code:400, message:"Invalid amount"})
  else if(isNaN(data.total))
    res.status(201).send({status:false, code:400, message:"Invalid total"})
  else if(data.ordertype == "stop" || data.ordertype == "trigger"){
    data.pending = parseFloat(data.stoplimit) || parseFloat(data.stop);
    if(data.pending == undefined || data.pending == null || data.pending == '' )
      res.status(201).send({status:false, code:400, message:"Stop price is required"})
    else if(isNaN(data.pending))
      res.status(201).send({status:false, code:400, message:"Stop price is invalid"})
    else if(data.type == "buy" && parseFloat(data.price) > parseFloat(data.pending))
      res.status(201).send({status:false, code:400, message:'Stop price should greater than market price'})
    else if(data.type == "sell" && parseFloat(data.price) < parseFloat(data.pending))
      res.status(201).send({status:false, code:400, message:'Stop price should less than market price'})
    else
      next()
  }
  else
    next()
}
module.exports.fund_passcode = async (req, res, next) => {
  var n = parseInt(req.body.code);
  var digits = ("" + n).split("");
  var count = 0;
  for (var i = 0; i < digits.length; i++) {
    if (parseInt(digits[i]) + 1 == parseInt(digits[i + 1]))
      count++;
  }
  if (count > 2)
    res.send({ status: false, code: 400, message: 'Please add combined number as your passcode' })
  else
    next()
}

module.exports.authentication = async (req, res, next) => {
  if (req.body.code == undefined || req.body.code == null || req.body.code == '')
    res.status(201).send({ status: false, code: 400, message: 'OTP code is required' })
  else if (isNaN(req.body.code))
    res.status(201).send({ status: false, code: 400, message: 'OTP should contain 6 digits only' })
  else if (req.body.code.length !== 6)
    res.status(201).send({ status: false, code: 400, message: 'OTP should contain 6 digits only' })
  else
    next()
}