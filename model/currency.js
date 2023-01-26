const mongoose = require('mongoose')

var currencySchema = new mongoose.Schema({
	currency: { type: String, required: true, unique: true }, // currency name
	id: { type: String },
	symbol: { type: String, required: true }, // currency symbol
	type: { type: String, enum: ['crypto', 'fiat'], required: true }, // currency type crypto or fiat
	cointype: { type: String, enum: ['token', 'coin'], default: 'coin' }, // coin type token or coin for crypto only
	logo: { type: String, default: '' }, // currency logo
	status: { type: Boolean, default: true }, // currency status
	feetype: { type: String, enum: ['flat', 'percent'], default: 'flat' }, // currency fee type
	min_deposit: { type: Number, default: 0 }, // min deposit amount for individual and corporate
	max_deposit: { type: Number, default: 0 }, // max deposit amount for individual and corporate
	deposit_fee: { type: Number, default: 0 }, // deposit fee
	fee: { type: Number, default: 0 }, // withdraw fee
	min_withdraw: { type: Number, default: 0.5 }, // min withdraw individual user
	max_withdraw: { type: Number, default: 1 }, // max withdraw individual user
	min_withdraw_corporate: { type: Number, default: 0.5 }, // min withdraw corporate user
	max_withdraw_corporate: { type: Number, default: 1 }, // max withdraw corporate user
	min_trade_amount: { type: Number, default: 0.05 },
	withdrawl_limit_d: { type: Number, default: 1 }, // day withdrawl limit
	withdrawl_limit_d_opt: { type: Boolean, default: true }, // Boolean for day based limit enable-disable
	withdrawl_limit_m_opt: { type: Boolean, default: false }, // Boolean for month based limit enable-disable
	btc_value: { type: Number, default: 1 }, // btc value 
	withdrawl_limit_m: { type: Number, default: 0 }, // month withdrawl limit
	decimal: { type: Number, default: 6 }, // decimal value for erc20 token
	contract_address: { type: String, default: '' }, // contract address for erc20 token
	network: { type: String, default: 'rpc' },
	deposit: { type: Boolean, default: true }, // block deposit for currency
	withdraw: { type: Boolean, default: true }, // block withdraw for currency
	date: { type: Date }, // coin generated date
	udate: { type: Date, default: Date.now }, // last updated date
	description: { type: String, default: '' }, // about currency
	site: { type: String, default: '' }, // official site
	latest_block: { type: Number, default: 11926164 }, // erc20 last block number
	whitepaper: { type: String, default: '' }, // currency white paper
	git_details: { type: String, default: '' }, //  currency git url
	asset_data: { type: String, default: '' }, // currency description
	wallet_address: { type: String, default: "" },
	deposit_auto: { type: Boolean, default: false },
	withdraw_auto: { type: Boolean, default: false },
	circulating_supply: { type: Number, default: 111 },
	transfer_percent: { type: Number, default: 0 },
	coin_id: { type: Number, default: 0 },
	discount_type: { type: String, enum: ['flat', 'percent'], default: 'percent' },
	discount_value: { type: Number, default: 0 },
	depositReward: { type: Boolean, default: false },
	depositRewardValue: { type: Number, default: 0 },
	marketPrice:{
		type:Object
	},
	walletTransferFee:{
		type:Number,
		default:0
	}
})

currencySchema.index({ currency: 1, symbol: 1 });
module.exports = mongoose.model('MRADULEXG_CURRDETSTE', currencySchema, 'MRADULEXG_CURRDETSTE')