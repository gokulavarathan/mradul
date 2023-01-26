var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.dbconnection,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false});   

var db = mongoose.connection;
db.on('error', function(error){
	console.log(`Attempting to reconnect database ${config.dbconnection}`);
	reconnect()
}); 

db.once('open', function(callback){
	console.log("config.dbconfn", config.dbconnection)
	console.log(`database connection succeeded`);
})

function reconnect(){
	mongoose.connect(config.dbconnection,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false});   
	db = mongoose.connection;
	db.on('error', function(error){
		console.log(`Attempting to reconnect database ${config.dbconnection}`);
		reconnect()
	}); 
	db.once('open', function(callback){
		console.log(`database connection succeeded`);
	})
}

//p2p pair require

let currencyp2p = require('../model/p2p_currency');
let p2pusers = require('../model/p2p_user');
let P2PORDER = require('../model/orderp2p');
let ordermap = require('../model/ordermapping');
let payment = require('../model/payment');
let p2pnotification = require('../model/p2p-notification');

var conn2 = mongoose.createConnection(config.dbconnection2);

let p2pcurrency = conn2.model('p2p_currency', currencyp2p, 'MRADULEXG_PTPCURRENCY');
let p2puser = conn2.model('p2p_user', p2pusers, 'MRADULEXG_PTPUSER');
let orderp2p = conn2.model('orderp2p', P2PORDER, 'MRADULEXG_ORDERP2P');
let ordermapping = conn2.model('ordermapping', ordermap, 'MRADULEXG_ORDERMAPPING')
let payment2 = conn2.model('payment', payment, 'MRADULEXG_PAYMENT');
let notification = conn2.model('p2p_notify', p2pnotification, 'MRADULEXG_PTPNOTIFY')

module.exports = {db2:conn2};
