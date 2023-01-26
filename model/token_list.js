var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var tokenSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'users' },
	token_name: { type: String, required: true },
	ticker_name: { type: String, required: true },
	token_logo: { type: String, default: '' },
	type: { type: String, enum: ['exclusive', 'non-exclusive'], default: 'exclusive' },
	issue_date: { type: Date, required: true },
	total_supply: { type: Number, required: true },
	offer_currency: { type: String, default: '' },
	offer_price: { type: Number, default: 0 },
	introduction: { type: String, required: true },
	official_website: { type: String, required: true },
	white_paper: { type: String, default: '' },
	explorer: { type: String, default: '' },
	source_code: { type: String, default: '' },
	community_info: { type: Array, default: [] },
	name_of_user: { type: String, required: true },
	role_of_user: { type: String, required: true },
	email: { type: String, required: true },
	mobile: { type: Number, required: true },
	attachments: { type: Array, default: [] },
	status: { type: Number, default: 2 },
	date: { type: Date },
	udate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MRADULEXG_TOKENLIST', tokenSchema, 'MRADULEXG_TOKENLIST');