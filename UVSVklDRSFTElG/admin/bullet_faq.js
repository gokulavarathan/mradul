var mongoose = require('mongoose'),
	Async = require('async');
var Common = require('../../helper/common');
//helper = require('../../helper/helper')

var faq = require('../../model/bullet_faq');

module.exports.faq = async (req, res) => {
	//if(Common._validate_origin(req, res)){
	if (req.body._id == undefined || req.body._id == null || req.body._id == '') {
		faq.create(req.body, (err, created_response) => {
			console.log('req.body------->', req.body)
			console.log(' created_response-------->', created_response)
			if (created_response)
				res.status(200).send({ status: true, code: 200, message: 'FAQ created successfully' })
			else if (!created_response)
				res.status(200).send({ status: true, code: 200, message: 'FAQ not created' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	} else {
		faq.updateOne({ _id: req.body._id }, { $set: req.body }, (err, created_response) => {
			if (created_response.nModified == 1)
				res.status(200).send({ status: true, code: 200, message: 'FAQ updated successfully' })
			else if (created_response.nModified == 0)
				res.status(200).send({ status: true, code: 200, message: 'FAQ not updated' })
			else
				res.status(201).send({ status: false, code: 401, message: 'server not found' })
		})
	}
	//}
}

module.exports.faq_list = async (req, res) => {
	//if(Common._validate_origin(req, res)){
	faq.find({}, { title: 1, answer: 1, date: 1, status: 1 }).sort({ date: -1 }).then((response) => {
		res.status(200).send({ status: true, code: 200, date: response })
	}).catch((error) => {
		res.status(201).send({ status: false, code: 400, message: 'server not found' })
	})
	//}
}
module.exports.faq_details = async (req, res) => {
	//if(Common._validate_origin(req, res)){
	faq.find({}, (err, response) => {
		if (response)
			res.status(200).send({ status: true, code: 200, data: response })
		else
			res.status(201).send({ status: false, code: 401, message: 'server not found' })
	})
	//}
}
module.exports.remove_faq = async (req, res) => {
	//if(Common._validate_origin(req, res)){
	var id = mongoose.Types.ObjectId(req.params.id);
	var faq_data = await faq.findOne({ _id: id }).exec()
	faq.deleteOne({ _id: id }, (err, deleted) => {
		if (deleted)
			res.status(200).send({ status: true, code: 200, message: 'FAQ deleted successfully' })
		else
			res.status(201).send({ status: false, code: 401, message: 'server not found' })
	})
	//}
}

module.exports.faq_content_details = async (req, res) => {
	//if(Common._validate_origin(req, res)){
	faq_content.findOne({ _id: req.params.id }, (err, response) => {
		if (response)
			res.status(200).send({ status: true, code: 200, data: response })
		else if (!response)
			res.status(200).send({ status: true, code: 200, message: 'No results found' })
		else
			res.status(201).send({ status: false, code: 401, message: 'server not found' })
	})
	//}
}
