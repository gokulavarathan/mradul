var block = require('../../model/blocklist'),
	history = require('../../model/history'),
	country = require('../../model/country'),
	user = require('../../model/user');

var Common = require('../../helper/common'),
	socket_config = require('../../helper/config');

module.exports.country_list = (req, res) => {
	if (Common._validate_origin(req, res)) {
		country.find({}).sort({ date: -1 }).then((response) => {
			res.status(200).send({ status: true, code: 200, data: response })
		}).catch((error) => {
			res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.get_country_details = (req, res) => {
	if (Common._validate_origin(req, res)) {
		country.findOne({ _id: req.params.id }, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else if (!response)
				res.status(201).send({ status: false, code: 400, message: 'No records found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}

module.exports.remove_country = (req, res) => {
	if (Common._validate_origin(req, res)) {
		var id = mongoose.Types.ObjectId(req.params.id);
		country.deleteOne({ _id: id }, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, message: 'Country removed successfully' })
			else
				res.status(201).send({ status: false, code: 400, message: "Country not removed" })
		})
	}
}

module.exports.block_country = (req, res) => {
	if (Common._validate_origin(req, res)) {
		country.findOne({ _id: req.params.id }, (err, country_data) => {
			if (country_data) {
				var status = !country_data.status ? true : false;
				country.updateOne({ _id: country_data.id }, { $set: { status: status } }, (err, response) => {
					if (response.nModified == 1) {
						if (!country_data.status) {
							this.blocked_country_users(country_data.country);
						}
						res.status(200).send({ status: true, code: 400, message: 'Country blocked successfully' })
					} else if (response.nModified == 0)
						res.status(201).send({ status: false, code: 400, message: 'Country details not updated' })
					else
						res.status(201).send({ status: false, code: 401, message: 'server not found' })
				})
			} else if (!country_data)
				res.status(201).send({ status: false, code: 400, message: 'No records found' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
}

module.exports.blocked_country_users = (country_name) => {
	user.aggregate([
		{ $match: { country: country_name } },
		{ $lookup: { from: 'aGlzdGyeQ', localField: '_id', foreignField: 'userId', as: 'session_data' } },
		{ $unwind: '$session_data' },
		{ $project: { userId: '$_id', session_id: '$session_data._id', token: '$session_data.access_token', ipaddress: '$session_data.ipaddress' } }
	], async (err, response) => {
		if (response.length > 0) {
			var user_ids = response.map((args) => { return args.session_id });
			var update_history = await history.updateMany({ _id: { $in: user_ids } }, { $set: { status: false } }).exec();
			user_ids = user_ids.map(element => {
				socket_config.sendmessage('timeout', { status: true, message: 'Session timeouted', token: element.token })
			})
		}
		return;
	})
}

module.exports.verify_ip_block = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		block.findOne({ name: req.body.ipaddress }, (err, response) => {
			if (response)
				res.send({ status: true, block: true, message: 'Your ip is blocked', ipaddress: req.body.ipaddress });
			else
				res.send({ status: true, block: false })
		})
	}
}

module.exports.ip_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		block.find({ category: 'ip' }, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.email_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		block.find({ category: 'email' }, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.verify_ip = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		block.findOne({ category: 'ip', name: req.body.ipaddress }, (err, response) => {
			if (response) {
				if (response.status)
					res.status(201).send({ status: true, code: 400, ipaddress: response.name, block: true })
				else
					res.status(201).send({ status: true, code: 200, ipaddress: response.name, block: false })
			} else if (!response)
				res.status(201).send({ status: false, code: 200, message: '' })
			else
				res.status(201).send({ status: false, code: 401, message: 'Server not found' })
		})
	}
}

module.exports.email_list = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		block.find({ category: 'email' }, (err, response) => {
			if (response)
				res.status(200).send({ status: true, code: 200, data: response })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.block_change_status = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		var block_data = await block.findOne({ _id: req.params.id }).exec()
		var status = !block_data.status ? true : false;
		block.updateOne({ _id: block_data._id }, { $set: { status: status } }, (err, updated) => {
			if (updated.nModified == 1) {
				if (block_data.category == 'ip') {
					if (status == false) {
						this.blocked_lists(block_data.name)
						socket_config.sendmessage('ip-blocked', { status: true, block: true, message: 'Your ip is blocked', address: block_data.name });
					}
				}
				res.status(200).send({ status: true, code: 200, message: 'Status updated successfully' })
			}
			else if (updated.nModified == 0)
				res.status(201).send({ status: false, code: 400, message: 'Status not updated' })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.block_remove = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		block.deleteOne({ _id: req.params.id }, (err, deleted) => {
			if (deleted)
				res.status(200).send({ status: true, code: 200, message: 'Document removed successfully' })
			else
				res.status(201).send({ status: false, code: 400, message: 'server not found' })
		})
	}
}

module.exports.block_update = async (req, res) => {
	if (Common._validate_origin(req, res)) {
		if (req.body.category == 'email') {
			req.body.name = req.body.name.split('@')[1].toLowerCase();
		};

		var blocked_data = await block.findOne({ category: req.body.category, name: req.body.name }).exec()
		if (req.body._id == undefined || req.body._id == null || req.body._id == '') {
			req.body.date = new Date();
			if (blocked_data)
				res.status(200).send({ status: true, code: 200, message: 'Data added successfully' })
			else {
				block.create(req.body, (err, created) => {
					if (created) {
						if (req.body.category == 'ip') {
							this.blocked_lists(req.body.name)
							socket_config.sendmessage('ip-blocked', { status: true, block: true, message: 'Your ip is blocked', address: req.body.name });
						}
						res.status(200).send({ status: true, code: 200, message: 'Data added successfully' })
					}
					else if (!created)
						res.status(201).send({ status: false, code: 400, message: 'Document not added' })
					else
						res.status(201).send({ status: false, code: 400, message: 'server not found' })
				})
			}
		}
		else {
			block.updateOne({ _id: req.body._id }, { $set: req.body }, (err, response) => {
				if (response.nModified == 1) {
					if (req.body.category == 'ip' && req.body.status === true) {
						this.blocked_lists(req.body.name)
						socket_config.sendmessage('ip-blocked', { block: true, message: 'Your ip is blocked', address: req.body.name });
					}
					res.status(200).send({ status: true, code: 200, message: 'Document updated successfully' })
				}
				else if (response.nModified == 0)
					res.status(201).send({ status: false, code: 200, message: 'Already up to date. No changes found' })
				else
					res.status(201).send({ status: false, code: 400, message: 'server not found' })
			})
		}
	}
}

module.exports.blocked_lists = (address) => {
	history.find({ ipaddress: address, status: true }, (err, response) => {
		if (response.length > 0) {
			response = response.map(element => {
				socket_config.sendmessage('ip-blocked', { status: true, block: true, message: 'Your ip is blocked', address: element.ipaddress, token: element.access_token })
			})
		}
		return;
	})
}	