var jwt = require('jsonwebtoken'),
	path = require('path');

var keys = require('../keyfiles/keystore'),
	Authenticate = require('./alert'),
	whitelist = require('../QRklHLVNFRFWE/KSJOFIERWROPWERUWER');


exports.verify_origin = async (req, res, next) => {
	// if(whitelist.indexOf(req.headers.origin) > -1)
	next()
	// else{
	// await Authenticate._alertMessage(req);
	// res.status(401).sendFile(path.join(__dirname, '../views/error.html'))
	// }
}


exports.isAdmin = (req, res, next) => {
	if (req.headers.tag === 'admin')
		next()
	else
		res.status(401).sendFile(path.join(__dirname, '../views/error.html'))
}

exports.isauthenticated = (req, res, next) => {
	var secret_key = keys.key;
	var token = req.headers.authorization;
	jwt.verify(token, secret_key, (err, decoded) => {
		if (decoded) {
			req.user_id = decoded.id;
			req.level = decoded.level;
			next()
		} else {

			res.status(201).send({ status: false, code: 400, message: 'Token expired' })
		}
	})
}

exports.verify_token = (req, res, next) => {
	var token = req.headers.authorization;
	if (token == undefined || token == null || token == '')
		res.status(401).sendFile(path.join(__dirname, '../views/error.html'))
	else
		next()
}
exports.validate_session = (details, cb) => {
	var secret_key = keys.key;
	var token = details.access_token;
	jwt.verify(token, secret_key, (err, decoded) => {
		if (err)
			cb({ status: false })
		else
			cb({ status: true })
	})
}
exports.token_listing_form = async (req, res, next) => {
	if (req.body.token_name == undefined || req.body.token_name == null || req.body.token_name == '')
		res.status(201).send({ status: false, code: 400, message: 'Token name is required' })
	else if (req.body.token_name.length > 3) {
		res.status(201).send({ status: false, code: 400, message: 'Token name should contain maximum 3 characters' })
	}
	else if (req.body.ticker == undefined || req.body.token_name == null || req.body.token_name == '')
		res.status(201).send({ status: false, code: 400, message: 'Ticker name is required' })
	else if (req.body.ticker.length < 2 || req.body.ticker.length >= 5)
		res.status(201).send({ status: false, code: 400, message: 'Ticker should be 3-5 characters only' })
	else if (req.body.issue_date == undefined || req.body.issue_date == null || req.body.issue_date == '')
		res.status(201).send({ status: false, code: 400, message: 'Date of issue is required' })
	else if (req.body.total_supply == undefined || req.body.total_supply == null || req.body.total_supply == '')
		res.status(201).send({ status: false, code: 400, message: 'Total supply is required' })
	else if (isNaN(req.body.total_supply))
		res.status(201).send({ status: false, code: 400, message: 'Total supply is invalid' })
	else if (req.body.website == undefined || req.body.website == null || req.body.website == '')
		res.status(201).send({ status: false, code: 400, message: 'Website URL is required' })
	else if (req.body.white_paper == undefined || req.body.white_paper == null || req.body.white_paper == '')
		res.status(201).send({ status: false, code: 400, message: 'White paper URL is required' })
	else if (req.body.explorer == undefined || req.body.explorer == null || req.body.explorer == '')
		res.status(201).send({ status: false, code: 400, message: 'Explorer URL is required' })
	else if (req.body.source_code == undefined || req.body.source_code == null || req.body.source_code == '')
		res.status(201).send({ status: false, code: 400, message: 'Github source URL is required' })
	else if (req.body.username == undefined || req.body.username == null || req.body.username == '')
		res.status(201).send({ status: false, code: 400, message: 'Your name is required' })
	else if (req.body.username.length < 3 && req.body.username.length >= 30)
		res.status(201).send({ status: false, code: 400, message: 'Your name should be 3-30 characters only' })
	else if (req.body.role == undefined || req.body.role == null || req.body.role == '')
		res.status(201).send({ status: false, code: 400, message: 'Your role is required' })
	else if (req.body.email == undefined || req.body.email == null || req.body.email == '')
		res.status(201).send({ status: false, code: 400, message: 'Email address is required' })
	// else if (!email_pattern.test(req.body.email))
	// 	res.status(201).send({ status: false, code: 400, message: 'Invalid email address' })
	else if (req.body.mobile == undefined || req.body.mobile == null || req.body.mobile == '')
		res.status(201).send({ status: false, code: 400, message: 'Mobile number is required' })
	else if (req.body.mobile.length < 6 && req.body.length >= 16)
		res.status(201).send({ status: false, code: 400, message: 'Mobile number should be 6-16 digits only' })
	else if (isNaN(req.body.mobile))
		res.status(201).send({ status: false, code: 400, message: 'Invalid mobile number' })
	else if (req.body.offer_currency == undefined || req.body.offer_currency == null || req.body.offer_currency == '')
		res.status(201).send({ status: false, code: 400, message: 'Offering currency is required' })
	else if (req.body.offer_price == undefined || req.body.offer_price == null || req.body.offer_price == '')
		res.status(201).send({ status: false, code: 400, message: 'Offering price is required' })
	else if (isNaN(req.body.offer_price))
		res.status(201).send({ status: false, code: 400, message: 'Invalid Offering price' })
	else if (req.body.project_description == undefined || req.body.project_description == null || req.body.project_description == '')
		res.status(201).send({ status: false, code: 400, message: 'Project description is required' })
	else if (req.body.logo == undefined || req.body.logo == null || req.body.logo == '')
		res.status(201).send({ status: false, code: 400, message: 'Asset logo is required' })
	else if (req.body.attachment_datas == undefined || req.body.attachment_datas == null || req.body.attachment_datas == '')
		res.status(201).send({ status: false, code: 400, message: 'Documents is required' })
	else if (req.body.attachment_datas.length == 0)
		res.status(201).send({ status: false, code: 400, message: 'Please upload your documents' })
	else
		next()
}