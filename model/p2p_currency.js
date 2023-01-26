const mongoose = require('mongoose');

const p2pCurrencySchema = new mongoose.Schema({
    currency: { type: String, required: true, unique: true }, // currency name
	id: { type: String },
	symbol: { type: String, required: true }, // currency symbol
	type: { type: String, enum: ['crypto', 'fiat'], required: true }, // currency type crypto or fiat
	logo: { type: String, default: '' }, // currency logo
	status: { type: Boolean, default: true }, // currency status
	feetype: { type: String, enum: ['flat', 'percent'], default: 'flat' }, // currency fee type
	btc_value: { type: Number, default: 1 }, // btc value 
	decimal: { type: Number, default: 6 }, // decimal value for erc20 token
	date: { type: Date }, // coin generated date
	udate: { type: Date, default: Date.now }, // last updated date
	description: { type: String, default: '' }, // about currency
})

module.exports = p2pCurrencySchema;
