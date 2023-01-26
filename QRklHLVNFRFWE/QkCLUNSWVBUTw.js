var Encrypter = require('../helper/encrypter');
module.exports = {
	"bnb":{
		"address":Encrypter._decrypt("U2FsdGVkX1%2FgHDASoL8AX0JayoAkIwECLMtCLjvl%2FJFcqnHWPIrNkJUEUX1ZjqSiWWscjDZOIc%2F8IMJxniAD4g%3D%3D").slice(1, -1),
		"secret":Encrypter._decrypt("U2FsdGVkX1%2B9uK2kCM628MgKSuJcnz%2Fj4L36TMa36XfMZ8N0ITUPMHcYKXbUDQGy0vTZg7%2BBA6XV%2FEg%2FwENud8vdXSVcRgOa%2FaFdP15VZKzhRYvw38rZyPrF1Lu5Ubr3").slice(1, -1),
		"tag":Encrypter._decrypt("U2FsdGVkX1%2BWdS%2FEFW0o6Y7xr3yyoavtHc7tkJ6c8g1MfD%2Fhh4VJwiX9RV0IKvus").slice(1, -1)
	}
}
