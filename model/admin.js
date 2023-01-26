var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	role: {
		type: String,
		enum: ['admin', 'subadmin']
	},
	username: {
		type: String,
		default: ''
	},
	password: {
		type: String,
		default: ''
	},
	pattern: {
		type: String,
	},
	salt: {
		type: String,
		default: ''
	},
	email: {
		type: String,
		default: ''
	},
	isActive: {
		type: Boolean,
		default: true
	},
	avatar: {
		type: String,
		default: ''
	},
	permission: [{
		module: {
			type: String,
			default: ''
		},
		module_name: {
			type: String,
			default: ''
		},
		submodule: {
			type: Array,
			default: []
		},
		read: {
			type: Boolean,
			default: false
		},
		write: {
			type: Boolean,
			default: false
		}
	}],
	attempt: {
		type: Number,
		default: 0
	},
	tfa: {
		dataURL: {
			type: String,
			default: ''
		},
		otpURL: {
			type: String,
			default: ''
		},
		tempSecret: {
			type: String,
			default: ''
		}
	},
	tfaVerified: {
		type: Boolean,
		default: false
	},
	created_at: {
		type: Date
	},
	udate: {
		type: Date,
		default: Date.now
	}

})

module.exports = mongoose.model('MRADULEXG_ADMCRE', userSchema, 'MRADULEXG_ADMCRE')	