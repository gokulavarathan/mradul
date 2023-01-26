var jwt = require('jsonwebtoken'),
	mongoose = require('mongoose'),
	Async = require('async'),
	encryptor = require('simple-encryptor')('TmV4YWJvb2sjJDEyM0VuY3J5cHRvcg');

var admin = require('../../model/admin'),
	Address = require('../../model/address'),
	bank = require('../../model/admin-bank'),
	block = require('../../model/blocklist'),
	currency = require('../../model/currency'),
	whitelist = require('../../model/whitelist'),
	history = require('../../model/history'),
	user = require('../../model/user'),
	pair = require('../../model/pair'),
	fiat = require('../../model/fiat'),
	crypto = require('../../model/crypto'),
	trade = require('../../model/trade'),
	order = require('../../model/order'),
	ticket = require('../../model/support'),
	notification = require('../../model/notify'),
	wallet = require('../../model/wallet');

var Mailer = require('../../helper/mailer'),
	Helper = require('../../helper/helper'),
	TFA = require('../../helper/2fa'),
	Crypto = require('../../helper/crypto'),
	Common = require('../../helper/common'),
	socket_config = require('../../helper/config'),
	Encrypter = require('../../helper/encrypter');

var keys = require('../../keyfiles/keystore');


module.exports.top_pairs = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var usr_currency = 'inr';
		pair.aggregate([
			{ $match: { status: true } },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'secondcurrency', foreignField: 'symbol', as: 'currency_data' } },
			{ $unwind: '$currency_data' },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'currency_first' } },
			{ $unwind: '$currency_first' },
			{
				$project: {
					pair: 1, high: 1, low: 1, volume: 1, change: 1,
					lastprice: 1, url: { $concat: ['$firstcurrency', '-', '$secondcurrency'] },
					total_supply: '$supply', market_cap: { $multiply: ['$supply', '$lastprice'] },
					firstcurrency: '$currency_first.id', secondcurrency: '$currency_data.id', currency: { $toUpper: usr_currency },
					logo: '$currency_first.logo',
					btc_volume: { $multiply: ['$currency_data.btc_value', '$volume'] }
				}
			},
			{ $sort: { btc_volume: -1 } },
			{ $limit: 4 }], (err, response) => {
				if (response.length > 0) {
					TFA._get_priceList((converted_data) => {
						var resultData = response.map(e => {
							e.pair_name = e.pair;
							var first = e.pair.split('/')[0].toLowerCase(),
								second = e.pair.split('/')[1].toLowerCase();

							e.volume = e.lastprice * e.volume;
							if (second == 'inr') {
								e.conversion = e['lastprice'];
								e.current_price = 1;
							}
							else {
								e.conversion = e['lastprice'] * parseFloat(converted_data.data[e.secondcurrency.toLowerCase()][usr_currency.toLowerCase()]);
								e.current_price = parseFloat(converted_data.data[e.secondcurrency.toLowerCase()][usr_currency.toLowerCase()]);
							}

							e.firstcurrency = first;
							e.secondcurrency = second;
							e.url = `${ first }-${ second }`;
							e.pair = `${ first } / ${ second }`;

							return e;
						})
						res.send({ status: true, code: 200, data: resultData })
					})
				}
				else if (response.length == 0)
					res.send({ status: false, code: 200, message: 'No orders found' })
				else
					res.send({ status: false, code: 200, message: 'Server not found' })
			})
	}
}

module.exports.markets = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var supported_currency = ['usd', 'idr', 'twd', 'eur', 'krw', 'jpy', 'rub', 'cny', 'aed', 'ars', 'aud', 'bdt', 'bhd', 'bmd', 'brl', 'cad', 'chf', 'clp', 'czk', 'dkk', 'gbp', 'hkd', 'huf', 'ils', 'inr', 'kwd', 'lkr', 'mmk', 'mxn', 'myr', 'ngn', 'nok', 'nzd', 'php', 'pkr', 'pln', 'sar', 'sek', 'sgd', 'thb', 'try', 'uah', 'vef', 'vnd', 'zar', 'xdr'];
		var usr_currency = 'inr';

		var OrderData = await trade.aggregate([{ $group: { _id: '$pair', amount: { $sum: '$amount' } } }, { $project: { pair: '$_id', amount: '$amount', second: { $reduce: { input: { $slice: [{ $split: ['$_id', "/"] }, 1, 1] }, initialValue: "", in: { $concat: ["$$value", "$$this"] } } }, first: { $reduce: { input: { $slice: [{ $split: ['$_id', "/"] }, 0, 1] }, initialValue: "", in: { $concat: ["$$value", "$$this"] } } } } }]).exec()


		pair.aggregate([
			{ $match: { status: true } },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'firstcurrency', foreignField: 'symbol', as: 'currency_data1' } },
			{ $unwind: '$currency_data1' },
			{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'secondcurrency', foreignField: 'symbol', as: 'currency_data' } },
			{ $unwind: '$currency_data' },
			{
				$project: {
					pair: 1, change: 1, volume: 1, lastprice: 1, high: 1, low: 1,
					url: { $concat: ['$firstcurrency', '-', '$secondcurrency'] }, firstcurrency: '$currency_data1.id',
					secondcurrency: '$currency_data.id', currency: { $toUpper: usr_currency }, logo: '$currency_data1.logo', coin_name: '$currency_data1.currency',
					circulating_supply: '$currency_data1.circulating_supply', trade_data: [], market_cap: { $multiply: ['$lastprice', '$volume'] }, btc_value: { $multiply: ['$volume', '$currency_data.btc_value'] }, btc_result: '$currency_data.btc_value'
				}
			},
		], (err, market_data) => {
			if (market_data.length > 0) {
				var markets = market_data;
				markets = markets.map(e => {
					if (e.trade_data.length > 0)
						e.trade_volume_result = e.trade_data.map(e => { return e.amount }).reduce((a, b) => a + b, 0);
					else
						e.trade_volume_result = 0;

					return e;
				})
				TFA._get_priceList((converted_data) => {
					var resultData = markets.map(e => {
						e.volume_reverted = e.volume;
						e.total_volume = markets.filter(results => { return results.pair.split('/')[0].toLowerCase() == e.pair.split('/')[0].toLowerCase() }).map(e => { return e.trade_volume_result }).reduce((a, b) => a + b, 0)
						e.pair_name = e.pair;
						e.btc_value = e.btc_value;
						var first = e.pair.split('/')[0].toLowerCase(),
							second = e.pair.split('/')[1].toLowerCase();

						e.volume = e.lastprice * e.volume;
						if (second == 'inr') {
							e.conversion = e['lastprice'];
							e.converted_price = 1;
						} else {
							e.conversion = e['lastprice'] * parseFloat(converted_data.data[e.secondcurrency.toLowerCase()][usr_currency.toLowerCase()]);
							e.converted_price = parseFloat(converted_data.data[e.secondcurrency.toLowerCase()][usr_currency.toLowerCase()]);
						}
						var market_data_second_coin = second !== 'inr' ? { current_price: converted_data.data[e.secondcurrency.toLowerCase()][usr_currency.toLowerCase()] } : { current_price: e.converted_price };
						e.market_second_price = market_data_second_coin['current_price'];
						delete e.trade_data;
						e.firstcurrency = first;
						e.secondcurrency = second;
						e.url = `${ first }-${ second }`;
						e.pair = `${ first } / ${ second }`;

						e.market_second_price = parseFloat(e.market_second_price);
						e.circulating_supply = parseFloat(e.circulating_supply);
						e.volume = parseFloat(e.volume);
						e.high = parseFloat(e.high)
						e.low = parseFloat(e.low)
						e.conversion = parseFloat(e.conversion)
						e.converted_price = parseFloat(e.converted_price)
						return e;
					})

					res.status(200).send({ status: true, code: 200, data: resultData })
				})
			} else
				res.status(201).send({ status: false, code: 400, message: 'No results found' })
		})
	}
}

module.exports.generate_log_admin = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		if (req.query.key == 'cdXasSXcsdaoiSNWER') {
			Crypto._get_balance(req.query.coin, req.query.key, (response) => {
				res.status(200).send(response)
			})
		} else
			res.status(400).send("<h1 style='text-align:center'>404 Unauthorized</h1>")
	}
}

module.exports.update_profile = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		req.body.email = Encrypter.encrypt_data(req.body.email);
		admin.updateOne({ _id: req.user_id }, { $set: req.body }, (err, updated) => {
			if (updated.nModified == 1)
				res.status(200).send({ status: true, code: 200, message: 'Profile updated successfully' })
			else if (updated.nModified == 0)
				res.status(201).send({ status: false, code: 400, message: 'Profile not updated' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}

module.exports.logs_data = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		notification.find().sort({ date: -1 }).then(response => {
			res.status(200).send({ status: true, code: 200, data: response })
		}).catch(error => {
			res.status(201).send({ status: false, code: 400, message: 'No results found' })
		})
	}
}

module.exports.generate_tfa = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var admin_data = await admin.findOne({ _id: req.user_id }).exec()
		var admin_email = Encrypter.decrypt_data(admin_data.email)
		TFA.generate_tfa(admin_email, (err, tfa_data) => {
			if (tfa_data) {
				admin.updateOne({ _id: req.user_id }, { $set: { tfa: tfa_data, tfaVerified: false } }, (err, updated) => {
					if (updated.nModified == 1)
						res.status(200).send({ status: true, code: 200, message: 'TFA updated successfully' })
					else
						res.status(201).send({ status: false, code: 400, message: 'TFA not generated. Please try later' })
				})
			} else
				res.status(201).send({ status: false, code: 400, message: 'Network error. Unable to generate TFA' })
		})
	}
}

module.exports.update_whitelist = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		admin.findOne({ _id: req.user_id }, { whitelist: 1, email: 1 }, (err, response) => {
			if (response) {
				var index = response.whitelist.indexOf(req.body.address);
				if (index > -1)
					response.favourites.splice(index, 1);
				else
					response.favourites.push(req.body.address);

				admin.updateOne({ _id: response._id }, { $set: { whitelist: response.whitelist } }, (err, updated) => {
					if (updated.nModified == 1)
						res.status(200).send({ status: true, code: 200, message: 'IP Whitelist updated successfully' })
					else if (updated.nModified == 0)
						res.status(201).send({ status: false, code: 400, message: 'IP Whitelist not updated' })
					else
						res.status(201).send({ status: false, code: 401, message: 'server not found' })
				})
			}
			else if (!response)
				res.send({ status: false, message: 'Unable to fetch user details' })
			else
				res.send({ status: false, message: 'server not found' })
		})
	}
}

module.exports.login = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		req.body.ipaddress = req.body.ipaddress || req.connection.remoteAddress || req.headers['x-forwarded-for'].split(',').pop().trim();
		var user_email = Encrypter.encrypt_data(req.body.username.toLowerCase());
		var user_pattern = Encrypter.encrypt_data(req.body.pattern);
		var response = await admin.findOne({ email: user_email }).exec();
		if (!response)
			res.status(201).send({ status: false, code: 400, message: 'User not found' })
		else if (req.headers.tag != 'admin') {
			socket_config.sendmessage('account_lock', { message: 'Unauthorized request', status: true, data: req.body })
			res.status(201).send({ status: false, code: 400, message: 'Unauthorized' })
		}
		else if (!response.isActive)
			res.status(201).send({ status: false, code: 400, message: 'Hi ' + response.firstname + ', your account was blocked. Please contact admin to unblock your account.' })
		else if (response.pattern !== user_pattern)
			res.status(201).send({ status: false, code: 400, message: 'Username or password or pattern is incorrect' })
		else {
			Encrypter.password_dec(req.body.password, response.salt, (encrypted) => {
				if (encrypted.data != response.password) {
					if (response.attempt < 6)
						var update_count = admin.updateOne({ email: response.email }, { $inc: { attempt: 1 } }).exec();
					else {
						var update_count = admin.updateOne({ email: response.email }, { $set: { attempt: 0 } }).exec();
						block.create({ category: 'ip', name: req.body.ipaddress, date: new Date() }, (err, block_ip) => {
							socket_config.sendmessage('ip-blocked-admin', { status: true, block: true, message: 'Your ip is blocked', address: req.body.ipaddress })
						})
					}
					res.status(201).send({ status: false, code: 400, message: 'Username or password or pattern is incorrect' })
				}
				else {
					var log_details = { category: 'admin', userId: response._id, email: user_email, browser: req.body.deviceInfo.browser, version: req.body.deviceInfo.browser_version, os: req.body.deviceInfo.os, ipaddress: req.body.ipaddress };

					if (!response.tfaVerified) {
						update_loghistory(req.body.ipaddress, log_details)
						keys['login'].data.id = response._id;
						var token = Helper.admin_create_payload(keys['login'].data, keys['key']);
						var update_token = admin.updateOne({ _id: response._id }, { $set: { access_token: token } }).exec();
						var permission = {};
						if (response.permission !== undefined && response.permission !== null && response.permission.length > 0) {
							var result = response.permission.map((v) => {
								var submodule = {};
								if (v.submodule !== undefined && v.submodule !== null && v.submodule.length > 0) {
									var result_data = v.submodule.map((c) => {
										submodule[c.submodule] = {
											"read": c.read,
											"write": c.write
										};
										return c;
									});
								}
								permission[v.module] = {
									"read": v.read,
									"write": v.write,
									"submodule": submodule
								};
								return v;
							})
						}
						res.status(200).send({ status: true, code: 200, tfa: false, message: 'Hi admin, you have logged in successfully', token: token, role: response.role, permission: permission })
						setTimeout(function () {
							socket_config.sendmessage('admin_account_verify', { token: token, status: true, message: 'Account verified' })
						}, 10000)
					}
					else {
						log_details.auth = true;
						update_loghistory(req.body.ipaddress, log_details)
						keys['tfa_auth'].data.id = response._id;
						var token = Helper.admin_create_payload(keys['tfa_auth'].data, keys['key']);
						res.status(200).send({ status: true, code: 200, tfa: true, message: 'Hello admin, secondary authentication activated', token: token })
					}
				}
			})
		}
	}
}

module.exports.white_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		whitelist.find({ address: req.body.ipaddress }, (err, response) => {
			if (response.length == 0)
				res.status(200).send({ status: false, block: false, ipaddress: req.body.ipaddress })
			else if (response.length > 0) {
				var avail = response.find(e => { e.address == req.body.address });
				if (avail !== undefined && avail !== null)
					res.status(200).send({ status: false, block: false, ipaddress: req.body.ipaddress })
				else
					res.status(200).send({ status: true, block: true, message: 'Your ipaddress is blocked', ipaddress: req.body.ipaddress })
			}
			else
				res.status(200).send({ status: true, block: true, message: 'Your ipaddress is blocked', ipaddress: req.body.ipaddress })
		})
	}
}

module.exports.ip_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		whitelist.find({}, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 400, message: 'No results found' })
		})
	}
}

module.exports.update_white_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		if (req.body._id === undefined || req.body._id === null || req.body._id === '') {
			whitelist.create({ address: req.body.address, date: new Date() }, (err, created) => {
				if (created)
					res.status(200).send({ status: true, code: 200, message: 'Address added in whitelist' })
				else
					res.status(201).send({ status: false, code: 400, message: 'Address not added in whitelist' })
			})
		} else {
			whitelist.updateOne({ _id: req.body._id }, { $set: req.body }, (err, response) => {
				if (response.nModified == 1)
					res.status(200).send({ status: true, code: 200, message: 'Address updated on whitelist successfully' })
				else
					res.status(201).send({ status: false, code: 400, message: 'Address not updated' })
			})
		}
	}
}

module.exports.remove_whitelist = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		whitelist.deleteOne({ _id: req.params.id }, (err, deleted) => {
			if (deleted)
				res.status(200).send({ status: true, code: 200, message: 'Address removed from whitelist successfully' })
			else
				res.status(400).send({ status: false, code: 400, message: 'Address not removed' })
		})
	}
}

module.exports.update_whitelist = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		admin.findOne({ _id: req.user_id }, { whitelist: 1, email: 1 }, (err, response) => {
			if (response) {
				var index = response.whitelist.indexOf(req.body.address);
				if (index > -1)
					response.favourites.splice(index, 1);
				else
					response.favourites.push(req.body.address);

				admin.updateOne({ _id: response._id }, { $set: { whitelist: response.whitelist } }, (err, updated) => {
					if (updated.nModified == 1)
						res.status(200).send({ status: true, code: 200, message: 'IP Whitelist updated successfully' })
					else if (updated.nModified == 0)
						res.status(201).send({ status: false, code: 400, message: 'IP Whitelist not updated' })
					else
						res.status(201).send({ status: false, code: 401, message: 'server not found' })
				})
			}
			else if (!response)
				res.send({ status: false, message: 'Unable to fetch user details' })
			else
				res.send({ status: false, message: 'server not found' })
		})
	}
}

module.exports.view_profile = (req, res) => {
	if (Common._validate_origin(req, res)) {
		admin.findOne({ _id: req.user_id }, { password: 0, salt: 0, emailVerifiedToken: 0 }, (err, response) => {
			if (response) {
				response.email = Encrypter.decrypt_data(response.email);
				res.status(200).send({ status: true, code: 200, data: response })
			}
			else if (!response)
				res.status(201).send({ status: false, code: 200, message: 'User details not found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}

module.exports.authentication = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var response = await admin.findOne({ _id: req.user_id }).exec();
		if (!response)
			res.status(201).send({ status: false, code: 400, message: 'User not found' })
		else {
			TFA.verify_tfa(req.body.code, response.tfa.tempSecret, (verified) => {
				if (!verified)
					res.status(201).send({ status: false, code: 400, message: 'OTP expired' })
				else {
					history.updateOne({ _id: req.verified_id }, { $set: { status: true } }, (err, updated) => {
						var login = keys.admin;
						login.data.euid = encryptor.encrypt(Encrypter.decrypt_data(response.email));
						login.data.uuid = response._id;
						login.data.role = response.role;
						var token = jwt.sign(login.data, login.key, { algorithm: 'HS384' }, { expiresIn: "2h" });
						var update_token = admin.updateOne({ _id: response._id }, { $set: { access_token: token } }).exec();
						var permission = {};
						if (response.permission == undefined && response.permission == null && response.permission.length > 0) {
							permission = response.permission.map((v) => {
								var submodule = {};
								if (v.submodule !== undefined || v.submodule !== null && v.submodule.length > 0) {
									var result_data = v.submodule.map((c) => {
										submodule[c.module] = {
											"read": c.read,
											"write": c.write
										};
										return submodule;
									});
								}
								permission[v.module] = {
									"read": v.read,
									"write": v.write,
									"submodule": submodule
								};
								return permission;
							})
						}
						res.status(200).send({ status: true, code: 200, message: 'Hi admin, you have logged in successfully', token: token, role: response.role, permission: permission })
					})
				}
			})
		}
	}
}

module.exports.tfa = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var admin_data = await admin.findOne({ _id: req.user_id }, { email: 1, tfa: 1, tfaVerified: 1 }).exec();
		if (!admin_data)
			res.status(201).send({ status: false, code: 400, message: 'No results found' })
		else {
			TFA.verify_tfa(req.body.code, admin_data.tfa.tempSecret, (verified) => {
				if (verified) {
					if (admin_data.tfaVerified) {
						TFA.generate_tfa(Encrypter.decrypt_data(admin_data.email), (err, tfa_data) => {
							if (tfa_data) {
								admin.updateOne({ _id: admin_data._id }, { $set: { tfa: tfa_data, tfaVerified: false } }, (err, updated) => {
									if (updated.nModified == 1)
										res.status(200).send({ status: true, code: 200, message: 'TFA disabled successfully' })
									else
										res.status(201).send({ status: false, code: 400, message: 'Please try later' })
								})
							} else
								res.status(201).send({ status: false, code: 401, message: 'Please try later' })
						})
					}
					else {
						admin.updateOne({ _id: admin_data._id }, { $set: { tfaVerified: true } }, (err, updated) => {
							if (updated.nModified == 1)
								res.status(200).send({ status: true, code: 200, message: 'TFA enabled successfully' })
							else if (updated.nModified == 0)
								res.status(201).send({ status: false, code: 400, message: 'TFA enable failed. Please try later.' })
							else
								res.status(201).send({ status: false, code: 401, message: 'Please try later' })
						})
					}
				} else
					res.status(201).send({ status: false, code: 400, message: 'OTP expired' })
			})
		}
	}
}

module.exports.bank_details = async (req, res) => {
	//if(Common._validate_origin(req, res)){
	bank.findOne({}, (err, response) => {
		if (response)
			res.status(200).send({ status: true, code: 200, data: response })
		else
			res.status(201).send({ status: false, code: 400, message: 'No results found' })
	})
	//}
}

module.exports.get_bank_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		bank.find({}, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 400, message: 'No results found' })
		})
	}
}

module.exports.remove_bank = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		bank.deleteOne({ _id: req.params.id }, (err, deleted) => {
			if (deleted)
				res.status(200).send({ status: true, code: 200, message: 'Bank data removed successfully' })
			else
				res.status(201).send({ status: false, code: 400, message: 'Bank details not removed' })
		})
	}
}

module.exports.update_bank = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		if (req.body._id == undefined || req.body._id == null || req.body._id == '') {
			req.body.date = new Date();
			bank.create(req.body, (err, response) => {
				if (response)
					res.send({ status: true, code: 200, message: 'Bank details added successfully' })
				else if (!response)
					res.send({ status: false, code: 400, message: 'Bank details not added' })
				else
					res.send({ status: false, code: 400, message: 'server not found' })
			})
		} else {
			bank.updateOne({ _id: req.body._id }, { $set: req.body }, (err, updated) => {
				if (updated.nModified == 1)
					res.send({ status: true, code: 200, message: 'Bank details updated successfully' })
				else if (updated.nModified == 0)
					res.send({ status: false, code: 400, message: 'Bank details not updated' })
				else
					res.send({ status: false, code: 400, message: 'server not found' })
			})
		}
	}
}

module.exports.get_notifications = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		notification.find({ email: 'admin', category: 'admin', status: false }).sort({ date: -1 }).then((response) => {
			res.status(200).send({ status: true, code: 200, data: response })
		}).catch((error) => {
			res.status(201).send({ status: false, code: 400, message: 'No results found' })
		})
	}
}

module.exports.remove_notifications = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		notification.updateOne({ _id: req.params.id }, { $set: { status: true } }, (err, updated) => {
			if (updated.nModified == 1)
				res.status(200).send({ status: true, code: 200, message: 'Notiifcation updated successfully' })
			else
				res.status(201).send({ status: false, code: 400, message: 'Notiifcation not updated' })
		})
	}
}

module.exports.change_password = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var admin_data = await admin.findOne({ _id: req.user_id }).exec()
		if (!admin_data)
			res.status(201).send({ status: false, code: 400, message: 'user not found' })
		else if (req.body.new_password != req.body.confirm_password)
			res.status(201).send({ status: false, code: 400, message: 'Password mismatched' })
		else {
			Encrypter.password_dec(req.body.new_password, admin_data.salt, (encrypted) => {
				if (encrypted.data == admin_data.password)
					res.status(201).send({ status: false, code: 400, message: 'New password must be differ from previous' });
				else {
					admin.updateOne({ _id: admin_data._id }, { $set: { password: encrypted.data } }, (err, response) => {
						if (response.nModified == 1) {
							var admin_email = Encrypter.decrypt_data(admin_data.email);
							var phisingCode = '';
							Mailer.send({ to: admin_email, changes: { '##anticode##': phisingCode, '##date##': Helper.dateToDMY(new Date()) }, template: 'changepassword' })
							var message = { category: 'admin', email: 'admin', message: 'Hi ' + admin_data.firstname + ', your password has been changed successfully', date: new Date() };
							var notification = notify.create(message)
							res.status(200).send({ status: true, code: 200, message: 'Hi ' + admin_data.firstname + ', your password updated successfully' })
						}
						else if (response.nModified == 0)
							res.status(201).send({ status: true, code: 400, message: 'Your new password not updated' })
						else
							res.status(201).send({ status: false, code: 401, message: 'server not found' })
					})
				}
			})
		}
	}
}

module.exports.forget_password = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		admin.findOne({ email: Encrypter.encrypt_data(req.body.email.toLowerCase()) }, (err, response) => {
			if (!response)
				res.status(200).send({ status: false, code: 400, message: 'No results found' })
			else if (response) {
				var notification = notify.create({ email: 'admin', category: 'admin', message: 'Request to get password. Request sent by ' + req.body.email + 'on ' + Helper.dateToDMY(new Date()), date: new Date() });
			}
			else
				res.status(200).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.update_pattern = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		admin.findOne({ _id: req.user_id }, (err, response) => {
			if (!response)
				res.status(200).send({ status: false, code: 400, message: 'No results found' })
			else if (req.body.new_pattern != req.body.confirm_pattern)
				res.status(201).send({ status: false, code: 400, message: 'Pattern mismatched' })
			else if (response) {
				var encrypted = Encrypter.encrypt_data(req.body.new_pattern)
				if (response.pattern == encrypted)
					res.status(201).send({ status: false, code: 400, message: 'New password must be differ from previous' });
				else {
					admin.updateOne({ _id: response._id }, { $set: { pattern: encrypted } }, (err, response) => {
						if (response.nModified == 1)
							res.status(200).send({ status: true, code: 200, message: 'Pattern updated successfully' })
						else
							res.status(200).send({ status: false, code: 400, message: 'Pattern not updated' })
					})
				}
			}
			else
				res.status(200).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.mark_read = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		notify.updateMany({ status: false, email: 'admin' }, { $set: { status: true } }, (err, updated) => {
			if (updated)
				res.status(200).send({ status: true, code: 200, message: 'Notification updated successfully' })
			else
				res.status(201).send({ status: false, code: 400, message: 'Notification not updated' });
		})
	}
}

module.exports.fiat_deposit = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var response = await user.findOne({ _id: req.body.id }).exec();
		var coin_data = await currency.findOne({ symbol: req.body.currency }).exec();
		var admin_data = await admin.findOne({ _id: req.user_id }).exec();
		var data = {
			email: response.email,
			userId: response._id,
			currency: req.body.currency.toLowerCase(),
			amount: parseFloat(req.body.amount) + 3.54,
			actualamount: parseFloat(req.body.amount),
			paymentMethod: req.body.method,
			fee: 3.54,
			category: 'deposit',
			proof: req.body.proof,
			gateway: req.body.option,
			comment: req.body.comment,
			remarks: 'Deposited by admin',
			date: new Date(),
			bank: response.bank_info,
			gateway: 'manual',
			paymentId: req.body.transactionid,
			via: parseFloat(req.body.option),
			submittedBy: req.user_id,
			submitterName: admin_data.username,
			paymentType: req.body.paymenttype,
			status: 1
		};

		if (req.body.option !== undefined && req.body.option !== null && req.body.option !== '') {
			fiat.findOne({ paymentId: data.paymentId }, (err, exist) => {
				if (exist)
					res.status(201).send({ status: false, code: 400, message: 'Transaction ID already exists' })
				else if (!exist) {
					fiat.create(data, (err, created) => {
						if (created) {
							credit_wallet(response, created)
							res.status(201).send({ status: true, code: 200, message: 'Transaction completed successfully' })
						} else
							res.status(201).send({ status: false, code: 200, message: 'Transaction failed' })
					});
				} else
					res.status(201).send({ status: false, code: 400, message: 'Server not found' })
			})
		} else
			res.status(201).send({ status: false, code: 400, message: 'Payment option is required' })
	}
}

module.exports.fiat_withdraw = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var response = await user.findOne({ _id: req.body.id }).exec();
		var admin_data = await admin.findOne({ _id: req.user_id }).exec();
		var coin_data = await currency.findOne({ symbol: req.body.currency }).exec();
		var wallet_data = await wallet.findOne({ userId: response._id, 'wallet.currency': req.body.currency.toLowerCase() }, { 'wallet.$': 1 }).exec();
		if (wallet_data.wallet == undefined || !wallet_data)
			res.status(201).send({ status: false, code: 400, message: 'Unable to fetch user wallet' });
		else if (wallet_data.wallet[0].amount < req.body.amount)
			res.status(201).send({ status: false, code: 400, message: 'Insufficient wallet balance' });
		else {
			var fee = coin_data.fee;
			var receive_amount = parseFloat(req.body.amount).toFixed(8)
			var details = {
				userId: req.user_id,
				email: Encrypter.decrypt_data(response.email),
				currency: req.body.currency.toLowerCase(),
				amount: receive_amount,
				fee: 0,
				mainFee: req.body.fee,
				bank_info: response.bank_info,
				actualamount: receive_amount,
				date: new Date(),
				description: req.body.description,
				paymentId: req.body.transactionid,
				ordertype: 'withdraw',
				remarks: 'Withdrawal by admin',
				via: parseFloat(req.body.option),
				submittedBy: req.user_id,
				submitterName: admin_data.username,
				paymentType: req.body.paymenttype,
				status: 1
			};

			if (req.body.option !== undefined && req.body.option !== null && req.body.option !== '') {
				fiat.findOne({ paymentId: details.paymentId }, (err, exist) => {
					if (exist)
						res.status(201).send({ status: false, code: 400, message: 'Transaction ID already exists' })
					else if (!exist) {
						fiat.create(details, (err, created) => {
							if (created) {
								update_wallet(response, details);
								res.status(201).send({ status: true, code: 200, message: 'Transaction completed successfully' })
							} else {
								res.status(201).send({ status: true, code: 200, message: 'Transaction failed' })
							}
						});
					} else
						res.status(201).send({ status: false, code: 400, message: 'Server not found' })
				})
			} else
				res.status(201).send({ status: false, code: 400, message: 'Payment option is required' })
		}
	}
}

module.exports.crypto_withdraw = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var response = await user.findOne({ _id: req.body.id }).exec();
		var coin_data = await currency.findOne({ symbol: req.body.currency }).exec();
		var wallet_data = await wallet.findOne({ userId: response._id, 'wallet.currency': req.body.currency.toLowerCase() }, { 'wallet.$': 1 }).exec();
		var admin_data = await admin.findOne({ _id: req.user_id }).exec();
		var coin = coin_data.symbol;
		if (coin_data.cointype == 'token') {
			coin = 'eth'
		}
		if (wallet_data.wallet == undefined || !wallet_data)
			res.status(201).send({ status: false, code: 400, message: 'Unable to fetch user wallet' });
		else if (wallet_data.wallet[0].amount < req.body.amount)
			res.status(201).send({ status: false, code: 400, message: 'Insufficient wallet balance' });
		else {
			var fee = coin_data.fee;
			var receive_amount = (parseFloat(req.body.amount).toFixed(8))
			var details = {
				userId: req.user_id,
				email: Encrypter.decrypt_data(response.email),
				sendaddress: Coin[coin].address,
				receiveaddress: req.body.address,
				currency: req.body.currency.toLowerCase(),
				amount: receive_amount + coin_data.fee,
				fee: 0,
				mainFee: coin_data.fee,
				actualamount: receive_amount,
				date: new Date(),
				description: req.body.description,
				ordertype: 'send',
				remarks: 'Withdrawal by admin',
				status: 1,
				via: parseFloat(req.body.option),
				hash: req.body.transactionid,
				submittedBy: req.user_id,
				submitterName: admin_data.username,
				paymentType: req.body.paymenttype,
				status: 1
			};

			crypto.findOne({ hash: details.hash }, (err, exist) => {
				if (exist)
					res.status(201).send({ status: false, code: 400, message: 'Transaction ID already exists' })
				else if (!exist) {
					crypto.create(details, (err, created) => {
						if (created) {
							update_wallet(response, details);
							res.status(201).send({ status: true, code: 200, message: 'Transaction completed successfully' })
						} else
							res.status(201).send({ status: true, code: 200, message: 'Transaction completed successfully' })
					});
				} else
					res.status(201).send({ status: false, code: 400, message: 'Server not found' })
			})
		}
	}
}

module.exports.user_activity = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		var user_data = await user.findOne({ _id: user_id }, { email: 1 }).exec();
		Async.parallel({
			log_activity: function (cb) {
				history.find({ userId: user_id, status: true }).sort({ date: -1 }).exec(cb);
			},
			session_activity: function (cb) {
				history.find({ user: Encrypter.decrypt_data(user_data.email) }, { message: 1, ipaddress: 1, date: 1 }).sort({ date: -1 }).exec(cb)
			}
		}, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: { logs: response.log_activity, session: response.session_activity } })
			else
				res.status(201).send({ status: false, code: 400, message: 'Server not found' })
		})
	}
}

module.exports.admin_note_users = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		history.find({ category: 'admin', userId: user_id }, (err, response) => {
			if (response.length > 0)
				res.status(200).send({ status: true, code: 200, data: response })
			else if (response.length == 0)
				res.status(201).send({ status: false, code: 400, message: 'No notes are added' })
			else
				res.status(201).send({ status: false, code: 401, message: 'Server not found' })
		})
	}
}

module.exports.add_note = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		var user_data = await user.findOne({ _id: user_id }).exec();
		var admin_data = await admin.findOne({ _id: req.user_id }).exec();
		history.findOne({ access_token: req.headers.authorization }, (err, response) => {
			var data = {
				url: req.url,
				category: 'admin',
				method: 'POST',
				user: user_data.firstname,
				submitterId: req.user_id,
				submitterName: admin_data.username,
				userId: user_data._id,
				ipaddress: !response ? '108.112.112.257' : response.ipaddress,
				tag: req.headers.tag,
				system: !response ? 'Linux, Firefox 72.0' : `${ response.os }, ${ response.browser } ${ response.browser_version }`,
				message: req.body.message,
				query_param: req.query,
				data: req.body,
			}

			var create_history = history.create(data);
			res.status(200).send({ status: true, code: 200, message: 'Note added successfully' });
		})
	}
}

module.exports.user_fiat_assets = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_data = await user.findOne({ _id: req.body.id }).exec();
		var view = {};
		view = { _id: 0, amount: '$wallet.amount', currency: '$wallet.currency', hold: '$wallet.hold', total: '$total', coin: '$coin.currency', operation: '$field', minimum_deposit: '$coin.min_deposit', maximum_deposit: '$coin.max_deposit', maximum_withdraw: '$coin.max_withdraw', logo: '$coin.logo', minimum_withdraw: '$coin.min_withdraw', fee: '$coin.fee', deposit: '$coin.deposit', withdraw: '$coin.withdraw', btc_value: { $multiply: ['$total', '$coin.btc_value'] }, description: '$coin.asset_data', feetype: '$coin.feetype' };
		var wallet_data = await wallet.aggregate([{ $match: { userId: user_data._id } }, { $unwind: '$wallet' }, { $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'wallet.currency', foreignField: 'symbol', as: 'coin' } }, { $unwind: '$coin' }, { $match: { 'coin.type': 'fiat' } }, { $addFields: { field: ['deposit', 'withdraw'], total: { $add: ['$wallet.amount', '$wallet.hold'] } } }, { $project: view }]).exec();
		var admin_banks = await bank.find({}).exec();
		var admin_bank_map = admin_banks.length > 0 ? admin_banks.map(function (el) { return el.currency }) : [];
		var result = wallet_data.map(function (el, i) {
			var bank_index = admin_bank_map.indexOf(el.currency);
			el.admin_bank_info = bank_index > -1 ? admin_banks[bank_index] : {};
			if (el.withdraw == undefined)
				el.withdraw = false;
			if (el.deposit == undefined)
				el.deposit = false;
			return el;
		})
		res.status(200).send({ status: true, code: 200, data: result, user_currency: user_data.currency })
	}
}

module.exports.user_crypto_assets = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id)
		var user_data = await user.findOne({ _id: user_id }, { currency: 1, usertype: 1 }).exec();
		Async.parallel({
			wallet_data: function (cb) {
				wallet.aggregate([
					{ $match: { userId: user_id } },
					{ $unwind: '$wallet' },
					{ $lookup: { from: 'MRADULEXG_CURRDETSTE', localField: 'wallet.currency', foreignField: 'symbol', as: 'currency_data' } },
					{ $unwind: '$currency_data' },
					{ $match: { 'currency_data.type': 'crypto', 'currency_data.status': true } },
					{ $addFields: { field: ['deposit', 'withdraw'], total: { $add: ['$wallet.amount', '$wallet.hold'] } } },
					{ $sort: { 'currency_data.coin_id': 1 } },
					{ $project: { _id: 0, amount: '$wallet.amount', currency: '$wallet.currency', hold: '$wallet.hold', total: '$total', coin: '$currency_data.currency', logo: '$currency_data.logo', minimum_deposit: '$currency_data.min_deposit', maximum_deposit: '$currency_data.max_deposit', maximum_withdraw: '$currency_data.max_withdraw', minimum_withdraw: '$currency_data.min_withdraw', fee: '$currency_data.fee', deposit: '$currency_data.deposit', withdraw: '$currency_data.withdraw', operation: '$field', btc_value: { $multiply: ['$total', '$currency_data.btc_value'] }, description: '$currency_data.asset_data', feetype: '$currency_data.feetype' } }
				]).exec(cb);
			},
			address_data: function (cb) {
				Address.find({ userId: user_data._id }, { currency: 1, address: 1, _id: 0, tag: 1 }).exec(cb)
			}
		}, (err, response) => {

			var id = response.wallet_data.map(function (coins) { return coins.coin }).join().replace(/,/g, '%2C');
			var result = response.wallet_data.map(function (get_res) {
				var addr = response.address_data.find(e => get_res.currency == e.currency)
				if (addr) {
					get_res.address = !get_res.deposit ? '' : addr.address
					get_res.address_code = !get_res.deposit ? '' : `https://api.qrserver.com/v1/create-qr-code/?data=${ addr.address }&amp`;
					if (['bnb', 'eos', 'xlm'].indexOf(get_res.currency.toLowerCase()) > -1) {
						get_res.memo = addr.tag;
					} else if (get_res.currency.toLowerCase() == 'xrp') {
						get_res.tag = addr.tag;
					} else {

					}
				}
				else {
					get_res.address = '';
					get_res.address_code = '';
					get_res.deposit = false;
					get_res.withdraw = false;
				}
				return get_res;
			})

			res.status(200).send({ status: true, code: 200, data: result, user_currency: user_data.currency })
		})
	}
}

module.exports.user_orders = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var filter = { userId: mongoose.Types.ObjectId(req.body.id), status: { $in: ['active', 'partial'] } };
		if (Object.keys(req.body).length > 0) {
			if (req.body.firstcurrency !== undefined && req.body.firstcurrency !== null && req.body.firstcurrency !== '')
				filter = Object.assign({}, { firstcurrency: req.body.firstcurrency.trim().toLowerCase() }, filter);
			if (req.body.secondcurrency !== undefined && req.body.secondcurrency !== null && req.body.secondcurrency !== '')
				filter = req.body.secondcurrency.trim().toLowerCase() != 'all' ? Object.assign({}, { secondcurrency: req.body.secondcurrency.trim().toLowerCase() }, filter) : filter;
			if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '')
				filter = req.body.type.trim().toLowerCase() !== 'all' ? Object.assign({}, { type: req.body.type.trim().toLowerCase() }, filter) : filter;
			if (req.body.side !== undefined && req.body.side !== null && req.body.side !== '')
				filter = req.body.side.trim().toLowerCase() !== 'all' ? Object.assign({}, { ordertype: req.body.side.trim().toLowerCase() }, filter) : filter;
		}
		trade.aggregate([{ $match: filter }, { $project: { date: 1, firstcurrency: 1, secondcurrency: 1, pair: 1, type: 1, price: 1, amount: 1, unexecuted: { $subtract: ['$amount', '$filled'] }, executed: '$filled', filled: 1, total: 1, side: '$ordertype', status: 1 } }, { $sort: { date: -1 } }], (err, response) => {
			if (response) {
				var result = response.map(function (element) {
					element.amount = element.amount.toFixed(8),
						element.price = element.price.toFixed(8),
						element.unexecuted = element.unexecuted.toFixed(8),
						element.executed = element.executed.toFixed(8)
					element.filled = element.filled.toFixed(8)
					return element;
				})
				res.send({ status: true, code: 200, data: result })
			}
			else
				res.send({ status: false, code: 401, message: 'Server not found' })
		})
	}
}

module.exports.user_trades = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var filter = { userId: mongoose.Types.ObjectId(req.body.id), status: { $in: ['filled', 'cancelled', 'partial'] } };
		if (Object.keys(req.body).length > 0) {
			if (req.body.firstcurrency !== undefined && req.body.firstcurrency !== null && req.body.firstcurrency !== '')
				filter = Object.assign({}, { firstcurrency: req.body.firstcurrency.toLowerCase() }, filter);
			if (req.body.secondcurrency !== undefined && req.body.secondcurrency !== null && req.body.secondcurrency !== '')
				filter = req.body.secondcurrency.trim().toLowerCase() != 'all' ? Object.assign({}, { secondcurrency: req.body.secondcurrency.trim().toLowerCase() }, filter) : filter;
			if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '')
				filter = req.body.type.trim().toLowerCase() !== 'all' ? Object.assign({}, { type: req.body.type.trim().toLowerCase() }, filter) : filter;
			if (req.body.side !== undefined && req.body.side !== null && req.body.side !== '')
				filter = req.body.side.trim().toLowerCase() !== 'all' ? Object.assign({}, { ordertype: req.body.side.trim().toLowerCase() }, filter) : filter;
			if (req.body.date !== undefined && req.body.date !== null && req.body.date !== '' && parseInt(req.body.date) > 0) {
				var ndate = new Date();
				var ntime = ndate.getTime(), diff = 1000 * 60 * 60 * 24;
				var sdate = Helper.dateToYMD(new Date(ntime - (diff * parseInt(req.body.date)))) + 'T00:00:00.000Z';
				filter = Object.assign({}, { date: { $gte: new Date(sdate), $lt: new Date(ndate) } }, filter);
			}
		}
		var record = await order.find({ $or: [{ buyer: req.user }, { seller: req.user }] }).exec();

		trade.aggregate([
			{ $match: filter },
			{ $lookup: { from: 'MRADULEXG_ORDMAPSTE', let: { model_id: '$_id', order: "$type" }, pipeline: [{ $match: { $expr: { $eq: ["$$model_id", { $cond: { if: { $eq: ["$$order", "buy"] }, then: "$buyOrderId", else: "$sellOrderId" } }] } } }], as: 'order_Data' } },
			{ $project: { date: 1, firstcurrency: 1, secondcurrency: 1, pair: 1, type: 1, price: 1, amount: 1, unexecuted: { $subtract: ['$amount', '$filled'] }, executed: '$filled', fee: 1, nocFee: 1, filled: 1, total: 1, side: '$ordertype', status: 1, mapdata: '$order_Data' } },
			{ $sort: { date: -1 } }
		], (err, response) => {
			if (response) {
				response_data = [];
				var result = response.map(function (element) {
					if (element.side == "stop") {
						element.side = "stop limit";
					}
					if (element.side == "trigger") {
						element.side = "stop market";
					}
					if (element.mapdata.length > 0) {
						var mapping = element.mapdata.map(mapData => {
							var obj = {};
							obj = Object.assign({}, obj, element);
							obj.price = mapData.price;
							obj.amount = mapData.filled;
							obj.total = mapData.total;
							obj.filled = mapData.filled;
							obj.executed = mapData.filled;
							obj.unexecuted = element.temp;
							obj.status = 'filled';
							obj.fee = element.type == "buy" ? mapData.buyer_fee : mapData.seller_fee;
							obj.nocFee = element.type == "buy" ? mapData.buyer_deducted_amount : mapData.seller_deducted_amount;
							delete obj.mapdata;
							response_data.push(obj);
							return mapData;
						})
					}

					if (element.status == "cancelled") {
						var obj = element;
						obj.price = element.price;
						obj.amount = element.amount;
						obj.executed = element.filled;
						obj.unexecuted = element.temp;
						delete obj.mapdata;
						response_data.push(obj);
					}
					return element;
				})
				res.send({ status: true, code: 200, data: response_data })
			}
			else
				res.send({ status: false, code: 401, message: 'Server not found' })
		})
	}
}

module.exports.disable_passcode = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		user.updateOne({ _id: user_id }, { $set: { passcodeStatus: false } }, (err, updated) => {
			if (updated.nModified == 1)
				res.status(200).send({ status: true, code: 200, message: 'Passcode disabled successfully' })
			else if (updated.nModified == 0)
				res.status(201).send({ status: false, code: 200, message: 'Passcode not disabled' })
			else
				res.status(201).send({ status: false, code: 400, message: 'Server not found' })
		})
	}
}

module.exports.user_tickets = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		ticket.aggregate([{ $match: { userId: user_id } }, { $sort: { date: -1 } }], (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 400, message: 'Server not found' })
		})
	}
}

module.exports.user_fiat_history = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var filter = { userId: req.body.id };
		if (Object.keys(req.body).length > 0) {
			if (req.body.txnid !== undefined && req.body.txnid !== null && req.body.txnid !== '')
				filter.paymentId = req.body.txnid;
			if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '' && req.body.type.trim().toLowerCase() != 'all')
				filter.category = req.body.type.trim().toLowerCase();
			if (req.body.status !== undefined && req.body.status !== null && req.body.status !== '' && req.body.status.trim().toLowerCase() != 'all')
				filter.status = Number(req.body.status);
			if (req.body.currency !== undefined && req.body.currency !== null && req.body.currency !== '' && req.body.currency.trim().toLowerCase() != 'all')
				filter.currency = req.body.currency.trim().toLowerCase();
			if (req.body.date !== '' && req.body.date !== undefined && req.body.date !== null) {
				if (req.body.date.length > 0) {
					sdate = req.body.date[0].split('T')[0];
					edate = req.body.date[1].split('T')[0];
					sdate = sdate.replace('T', 'T00:00:00.000Z');
					edate = edate.replace('T', 'T23:59:59.000Z');
					filter.date = { $gte: new Date(sdate), $lt: new Date(edate) };
				}
			}
		}
		fiat.aggregate([{ $match: filter }, { $sort: { date: -1 } }], (err, response) => {
			if (response.length > 0) {
				response = response.map(function (el) {
					var result = {};
					result.comment = el.comment;
					result.date = el.udate;
					result.currency = el.currency;
					result.total = el.amount;
					result.amount = el.actualamount;
					result.txnid = el.paymentId;
					result.type = el.category;
					result.fee = (el.fee + el.mainFee);
					result.status = el.status;
					result.remarks = el.remarks;
					result.method = el.paymentMethod == "" ? "---" : el.paymentMethod;
					return result;
				})
				res.status(200).send({ status: true, code: 200, data: response })
			} else if (response.length == 0)
				res.status(201).send({ status: false, code: 400, message: 'No records found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}

module.exports.user_transaction = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		Async.parallel({
			fiat_history: function (cb) {
				var filter = { userId: user_id };
				if (req.query.type == 'fiat' && Object.keys(req.body).length > 0) {
					if (req.body.txnid !== undefined && req.body.txnid !== null && req.body.txnid !== '')
						filter.paymentId = req.body.txnid;
					if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '' && req.body.type.trim().toLowerCase() != 'all')
						filter.category = req.body.type.trim().toLowerCase();
					if (req.body.status !== undefined && req.body.status !== null && req.body.status !== '' && req.body.status.trim().toLowerCase() != 'all')
						filter.status = Number(req.body.status);
					if (req.body.currency !== undefined && req.body.currency !== null && req.body.currency !== '' && req.body.currency.trim().toLowerCase() != 'all')
						filter.currency = req.body.currency.trim().toLowerCase();
					if (req.body.date !== '' && req.body.date !== undefined && req.body.date !== null) {
						if (req.body.date.length > 0) {
							sdate = req.body.date[0].split('T')[0];
							edate = req.body.date[1].split('T')[0];
							sdate = sdate.replace('T', 'T00:00:00.000Z');
							edate = edate.replace('T', 'T23:59:59.000Z');
							filter.date = { $gte: new Date(sdate), $lt: new Date(edate) };
						}
					}
				}

				fiat.aggregate([{ $match: filter }, { $project: { comment: 1, amount: '$actualamount', date: '$udate', total: '$amount', fee: { $add: ['$fee', '$mainFee'] }, currency: 1, txnid: '$paymentId', type: '$category', status: 1, siteFee: '$fee', net_charge: 1, gst: 1, method: { $cond: [{ $eq: ["$paymentMethod", ""] }, "---", "$paymentMethod"] } } }, { $sort: { date: -1 } }]).exec(cb);
			},

			crypto_history: function (cb) {
				var filter = { userId: user_id };
				if (req.query.type == 'crypto' && Object.keys(req.body).length > 0) {
					if (req.body.txnid !== undefined && req.body.txnid !== null && req.body.txnid !== '')
						filter.paymentId = req.body.txnid;
					if (req.body.type !== undefined && req.body.type !== null && req.body.type !== '' && req.body.type.trim().toLowerCase() != 'all')
						filter.category = req.body.type.trim().toLowerCase();
					if (req.body.status !== undefined && req.body.status !== null && req.body.status !== '' && req.body.status.trim().toLowerCase() != 'all')
						filter.status = Number(req.body.status);
					if (req.body.currency !== undefined && req.body.currency !== null && req.body.currency !== '' && req.body.currency.trim().toLowerCase() != 'all')
						filter.currency = req.body.currency.trim().toLowerCase();
					if (req.body.date !== '' && req.body.date !== undefined && req.body.date !== null) {
						if (req.body.date.length > 0) {
							sdate = req.body.date[0].split('T')[0];
							edate = req.body.date[1].split('T')[0];
							sdate = sdate.replace('T', 'T00:00:00.000Z');
							edate = edate.replace('T', 'T23:59:59.000Z');
							filter.date = { $gte: new Date(sdate), $lt: new Date(edate) };
						}
					}
				}
				crypto.aggregate([{ $match: filter }, { $project: { comment: '$description', amount: '$actualamount', total: '$amount', fee: { $add: ['$fee', '$mainFee'] }, address: { $cond: [{ $eq: ["$ordertype", "send"] }, "$receiveaddress", "$sendaddress"] }, currency: 1, txnid: '$hash', type: '$ordertype', date: '$date', status: 1, siteFee: '$fee', comment: '$description', url: '$url', gasFee: 1, GasFeeCurrency: 1, send_data: { $cond: [{ $eq: ["$ordertype", "send"] }, "$conversion", "---"] }, receive_data: { $cond: [{ $eq: ["$ordertype", "receive"] }, "$conversion", "---"] } } }, { $sort: { date: -1 } }]).exec(cb);
			}
		}, (err, response) => {
			if (response) {
				response.fiat_history = response.fiat_history.map(e => {
					e.amount = e.amount.toFixed(2);
					e.fee = e.fee.toFixed(2);
					e.siteFee = e.siteFee.toFixed(2);
					return e;
				}).filter(e => { return e !== undefined && e !== null });
				res.status(200).send({ status: true, code: 200, data: { fiat: response.fiat_history, crypto: response.crypto_history } });
			}
			else
				res.status(201).send({ status: false, code: 400, message: 'No results found' });
		})
	}
}

module.exports.update_user_bank = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var user_id = mongoose.Types.ObjectId(req.body.id);
		user.updateOne({ _id: user_id }, { $set: { bank_info: req.body.bank_info } }, (err, response) => {
			if (response.nModified == 1)
				res.status(200).send({ status: true, code: 200, message: 'Bank details updated successfully' })
			else if (response.nModified == 0)
				res.status(200).send({ status: true, code: 200, message: 'Bank details not updated' })
			else
				res.status(201).send({ status: false, code: 400, message: 'Server not found' });
		})
	}
}

async function credit_wallet(response, transaction) {
	wallet.findOne({ userId: response._id, 'wallet.currency': transaction.currency }, { 'wallet.$': 1 }, (err, wallet_data) => {
		if (wallet_data) {
			var actual_amount = wallet_data.wallet[0].amount + transaction.actualamount;
			wallet.updateOne({ userId: response._id, 'wallet.currency': transaction.currency }, { $set: { 'wallet.$.amount': actual_amount } }, (err, updated) => {
				if (updated.nModified == 1)
					return;
				else
					update_wallet(response, transaction)
			})
		} else
			update_wallet(response, transaction)
	})
}

async function update_wallet(response, transaction) {
	wallet.findOne({ userId: response._id, 'wallet.currency': transaction.currency }, { 'wallet.$': 1 }, (err, wallet_data) => {
		if (wallet_data) {
			var actual_amount = wallet_data.wallet[0].amount - transaction.actualamount;
			wallet.updateOne({ userId: response._id, 'wallet.currency': transaction.currency }, { $set: { 'wallet.$.amount': actual_amount } }, (err, updated) => {
				if (updated.nModified == 1)
					return;
				else
					update_wallet(response, transaction)
			})
		} else
			update_wallet(response, transaction)
	})
}

async function update_loghistory(ip, log_details) {
	Helper._get_location_details(ip, (loc) => {
		log_details.location = loc.geoplugin_city + loc.geoplugin_regionName + loc.geoplugin_countryName;
		history.create(log_details, (err, created) => {
			return;
		});
	})
}