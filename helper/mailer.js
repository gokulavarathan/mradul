
var nodemailer = require('nodemailer');

var sendGridMail = require('@sendgrid/mail');

var template = require('../model/template'),
	site = require('../model/site'),
	SMTP_DET = require('../QRklHLVNFRFWE/TUFJTF9EQVRB');

var transporter = nodemailer.createTransport({
	host: SMTP_DET.Mail.Host,
	port: SMTP_DET.Mail.Port,
	secure: true,
	auth: {
		user: SMTP_DET.Mail.User,
		pass: SMTP_DET.Mail.Pass
	}
});


var from_address = `Mradhul Exchange <support@mradulexchange.com>`,
	Newsletter = `Mradhul Exchange Newsletter <${ SMTP_DET.Mail.From }>`;


module.exports.send = async (data) => {
	var site_info = await site.findOne({}).exec();
	// Object.assign(data.changes, {
	// 	"##sitename##": site_info.sitename,
	// 	"##SITENAME##": site_info.sitename,
	// 	"##logo##": site_info.logo,
	// 	"##contactEmail##": site_info.contactEmail,
	// 	"##copyright##": site_info.copyright,
	// 	"##mobile##": site_info.mobile
	// });

	template.findOne({ title: data.template }, { content: 1, subject: 1 }, (err, response) => {
		if (response) {
			var content = response.content,
				subject = response.subject;

			for (var key in data.subject) {
				if (data.subject.hasOwnProperty(key)) {
					subject = subject.replace(key, data.subject[key])
				}
			}
			for (var key in data.changes) {
				if (data.changes.hasOwnProperty(key)) {
					content = content.replace(key, data.changes[key])
				}
			}
			content = content.replace(/##SITENAME##/g, site_info.sitename).replace(/##LOGO##/g, site_info.logo).replace(/##CONTACTEMAIL##/g, site_info.contactEmail).replace(/##COPYRIGHT##/g, site_info.copyright).replace(/##MOBILE##/g, site_info.mobile).replace(/##LINK##/g, site_info.sitelink)

			var details = { from: from_address, to: data.to, subject: subject, html: content };
			transporter.sendMail(details).then(mail => {
				return true
			}).catch(err => {
				return false;
			})
		} else {
			return false;
		}
	})
}

module.exports.newsletter = async (data) => {
	template.findOne({ title: data.template }, { content: 1, subject: 1 }, (err, response) => {
		if (response) {
			var content = response.content,
				subject = response.subject;

			for (var key in data.subject) {
				if (data.subject.hasOwnProperty(key)) {
					subject = subject.replace(key, data.subject[key])
				}
			}

			for (var key in data.changes) {
				if (data.changes.hasOwnProperty(key)) {
					content = content.replace(key, data.changes[key])
				}
			}

			var details = { from: Newsletter, to: data.to, subject: subject, html: content };
			transporter.sendMail(details).then(mail => {
				return true
			}).catch(err => {
				return false;
			})
		} else
			return false;
	})
}

module.exports.send_raw = async (data) => {
	var details = {
		from: from_address,
		to: data.to,
		subject: data.subject,
		html: data.content
	}

	transporter.sendMail(details).then(mail => {
		return true
	}).catch(err => {
		return false;
	})
}