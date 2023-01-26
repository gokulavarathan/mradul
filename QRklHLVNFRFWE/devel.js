var DB_Config = require('./ZGJjcmVkZWaWFs');

module.exports = {
	dbconnection: `mongodb://${ DB_Config.demo_db.host }:${ DB_Config.demo_db.port }/${ DB_Config.demo_db.name }`,
	// dbconnection2: 'mongodb://localhost:27017/mradul',
	dbconnection2:`mongodb://${ DB_Config.demo_db1.host }:${ DB_Config.demo_db1.port }/${ DB_Config.demo_db1.name }`,
	port: 3584
}

//7558
//4341