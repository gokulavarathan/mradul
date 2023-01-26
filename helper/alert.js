var helper = require('./helper'),
	keys = require('../keyfiles/keystore'),
	site = require('../model/site'),
	mailer = require('./mailer');

module.exports = {
	_alertMessage:async(req)=>{
		var ip = await ip_address(req);
		site.findOne({}, (err, response)=>{
			helper._get_location_details(ip, (loc)=>{
			var email_addr = response.contactEmail || keys.email;
			var content = keys.illegal_access.content;
			var changes = {
				"##ip##":ip,
				"##browser##":req.headers["user-agent"].split("(")[0],
				"##location##":loc.geoplugin_city+', '+loc.geoplugin_region+', '+loc.geoplugin_countryName,
				"##domain##":req.headers.origin,
				"##path##":req.route.path,
				"##date##":helper.dateToYMD(new Date())
			}	

			for(var key in changes){
				content = content.replace(key, changes[key])						
			}

			return mailer.send_raw({to:email_addr, subject:keys.illegal_access.subject, content:content})
			})
		})
	}
}

async function ip_address(req){
	var ip = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'] || req.headers['fastly-client-ip'] || req.headers['true-client-ip'] || req.headers['x-real-ip'] || req.headers['x-cluster-client-ip'] || req.headers['x-forwarded'] || req.headers['forwarded-for'] || req.connection.remoteAddress.replace("::ffff:","");
	return ip;
}