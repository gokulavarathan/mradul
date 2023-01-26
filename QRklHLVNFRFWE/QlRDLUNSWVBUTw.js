var Encrypter = require('../helper/encrypter');

module.exports = {
	"btc":{
		"address":Encrypter._decrypt("U2FsdGVkX1%2BST0Z42rhXNmLjOye97Sz8Q8%2BE%2B9EJA56fquWNVKiawF4aKjJvLZmvdIz5t8cd4jd8dS3qQHZ7HA%3D%3D"),
		"host":Encrypter._decrypt("U2FsdGVkX1%2Fgc007WqQVYoqmn4yfwDar8rA4VpGFPlg%3D"),
		"user":Encrypter._decrypt("U2FsdGVkX18Bc5YAZDe%2Ba2HN9HeyXXiORpHsubvrXqo%3D"),
		"password":Encrypter._decrypt("U2FsdGVkX18TdvK%2BWR5YM%2FUxM4NLD%2FoCmIN5unsTRVA%3D"),
		"port":Encrypter._decrypt("U2FsdGVkX1%2BcoZ7SQh5P8uP9c0%2FqQoGuT7xuo%2B43Qas%3D")
	}
}

