const mongoose = require('mongoose');
Schema = mongoose.Schema;

var userSchema = Schema({
	avatar: { type: String, default: '' },
	isActive: { type: Boolean, default: true },
	emailVerified: { type: Boolean, default: false },
	phone: { type: String, default: '' },
	address: { type: String, default: '' },
	address1: { type: String, default: '' },
	email: { type: String, required: true },
	password: { type: String, required: true },
	emailVerifiedToken: { type: String, default: '' },
	salt: { type: String, default: '' },
	username: { type: String, default: '' },
	firstname: { type: String, default: '' },
	lastname: { type: String, default: '' },
	dob: { type: String },
	city: { type: String, default: '' },
	state: { type: String, default: '' },
	country: { type: String, default: '' },
	pincode: { type: String, default: '' },
	age: { type: String, default: '' },
	gender: { type: String, enum: ['male', 'female', 'others'] },
	level: { type: Number, default: 0 },
	currency: { type: String, default: 'USD' },
	profileUpdated: { type: Boolean, default: false },
	passcode: { type: Number },
	passcodeStatus: { type: Boolean, default: false },
	passcodeUpdated: { type: Date },
	cronExecuted: { type: Date },
	referrer: { type: Schema.Types.ObjectId },
	referrals: { type: Array, default: [] },
	referral_code: { type: String },
	kyc: {
		proofname: { type: String, default: '' },
		proofnumber: { type: String, default: '' },
		front: { type: String, default: '' },
		back: { type: String, default: '' },
		selfie: { type: String, default: '' },
		proofstatus: { type: Number, default: 3 },
		selfiestatus: { type: Number, default: 3 }
	},
	kycVerified: { type: Boolean, default: false },
	favourites: { type: Array, default: [] },
	tfa: {
		dataURL: { type: String, default: '' },
		otpURL: { type: String, default: '' },
		tempSecret: { type: String, default: '' }
	},
	resetTime: { type: Date, default: new Date() },
	resetcode: { type: String, default: '' },
	operation: { type: Boolean, default: false },
	verificationCode: { type: String, default: '' },
	tfaVerified: { type: Boolean, default: false },
	bank_info: {
		account_type: { type: String, default: '' },
		bankname: { type: String, default: '' },
		branch: { type: String, default: '' },
		holder: { type: String, default: '' },
		accNumber: { type: Number },
		ibanCode: { type: String, default: '' },
		country: { type: String, default: '' }
	},
	bank_status: { type: Boolean, default: false },
	createdAt: { type: Date },
	termsCondition: { type: Boolean, default: false },
	accountConfirm: { type: Boolean, default: false },
	attempt: { type: Number, default: 0 },
	updatedAt: { type: Date, default: Date.now },
	Aid : {type:String, default:""},
	payment:{
		type:Array
	}
})

userSchema.index({ email: 1, referral_code: 1 }, { unique: true });

module.exports = mongoose.model('MRADULEXG_STEUSE', userSchema, 'MRADULEXG_STEUSE')