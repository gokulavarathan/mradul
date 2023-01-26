const mongoose = require('mongoose')

var pairSchema = new mongoose.Schema({
	// pair details
	pair:{ type:String, required:true, unique:true},
	firstcurrency:{ type:String, required:true },
	secondcurrency:{ type:String, required:true },
	description:{ type:String, default:'' },
	marketprice:{ type:Number, default:0.001 },
	lastprice:{ type:Number, default:0.001 },
	high:{ type:Number, default:0.001 },
	low:{ type:Number, default:0.001 },
	volume:{ type:Number, default:0 }, 
	volume_first:{ type:Number, default:0 },
	change:{ type:Number, default:0 },
	status:{ type:Boolean, default:true },
	date:{ type:Date },
	udate:{ type:Date, default:Date.now },

	// trade fees
	buyerfee:{type:Number, default:0},
	sellerfee:{type:Number, default:0},
	feetype:{type:String, enum:['flat', 'percent'], default:'flat'},

	// reward controls
	buyLiquidity:{type:Boolean, default:false},
	buyLiquidityReward:{type:Number, default:0},
	sellLiquidity:{type:Boolean, default:false},
	sellLiquidityReward:{type:Number, default:0},

	// trade controls
	tradeSpotLimit:{type:Boolean, default:true},
	tradeSpotMarket:{type:Boolean, default:true},
	tradeSpotStop:{type:Boolean, default:true},
	tradeSpotTrigger:{type:Boolean, default:true},
	tradeSpotBuy:{ type:Boolean, default:true },
	tradeSpotSell:{ type:Boolean, default:true },

	// bot controls
	min_amount:{ type:Number, default:0 },
	max_amount:{ type:Number, default:0 },
	min_price:{ type:Number, default:0 },
	max_price:{ type:Number, default:0 },
	bot_status:{ type:Boolean, default:false },

	// liquidity controls
	liquidity:{type:Boolean, default:false},
	binance_price:{type:Number, default:0},
	binance_change:{type:Number, default:0},
	binance_high:{type:Number, default:0},
	binance_low:{type:Number, default:0},
	binance_volume:{type:Number, default:0},
	binance_open:{type:Number, default:0},
	binance_close:{type:Number, default:0},
	pair_id:{type:Number, default:0},

	// trade discounts
	discount_type:{type:String, default:'percent', enum:['flat', 'percent']},
	discount_value:{type:Number, default:0}
})

pairSchema.index({ firstcurrency: 1, secondcurrency: 1, pair: 1 });
module.exports = mongoose.model('MRADULEXG_STEPAR', pairSchema, 'MRADULEXG_STEPAR')