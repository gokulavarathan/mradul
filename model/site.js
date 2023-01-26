const mongoose = require('mongoose')

var siteSchema = new mongoose.Schema({
	sitename: { type: String, default: '' },
	copyright: { type: String, default: '' },
	contactEmail: { type: String, default: '' },
	mobile: { type: Number, default: '' },
	address: { type: String, default: '' },
	facebook: { type: String, default: '' },
	youtube: { type: String, default: '' },
	twitter: { type: String, default: '' },
	telegram: { type: String, default: '' },
	telegramGrp: { type: String, default: '' },
	linkedin: { type: String, default: '' },
	sitemode: { type: Boolean, default: false },
	sitelink: { type: String, default: '' },
	referral_commission: { type: Number, default: 0 },
	noc_commission: { type: Number, default: 0 },
	logo: { type: String, default: '' },
	favicon: { type: String, default: '' },
	recaptcha_sitekey: { type: String, default: '' },
	recaptcha_secretkey: { type: String, default: '' },
	content: { type: String, default: '' },
	support: { type: Array, default: [] },
	api_Data: { type: String, default: '' },
	fiat: {
		deposit: { type: Boolean, default: false },
		withdraw: { type: Boolean, default: false }
	},
	exchange: { type: Boolean, default: false },
	crypto: {
		deposit: { type: Boolean, default: false },
		withdraw: { type: Boolean, default: false }
	},
	links: {
		ios: { type: String, default: '' },
		android: { type: String, default: '' },
		windows: { type: String, default: '' },
		mac: { type: String, default: '' }
	},
	isBotEnable: {
		type: Boolean,
		default: false
	},
	trade_minimum_percent: { type: Number, default: 5 },
	trade_maximum_percent: { type: Number, default: 5 },
	total_bonus_limit: { type: Number, default: 100 },
	bonus_spent_limit: { type: Number, default: 100 },
	p2p_timer:{type:Number} //In minutes
})

module.exports = mongoose.model('MRADULEXG_STEINSE', siteSchema, 'MRADULEXG_STEINSE')