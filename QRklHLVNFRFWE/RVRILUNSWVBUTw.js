var Encrypter = require('../helper/encrypter');

module.exports = {
	"eth":{
		// "address":Encrypter._decrypt("U2FsdGVkX19UlAc%2BTIxW3qDvQytdMfoWi5XJ1gCvqscMXn5SkpHtdkJ8xSvzxjcwqQqCd80VBwSLRkAXUfn1PQ%3D%3D").slice(1,-1),
		"address":Encrypter._decrypt("U2FsdGVkX18Jl5LrpzsC2V11QJlY4s2v1ZbmAPjMB1W2JGeyS%2BUj5TbvbZyUvpj8I6CE5WEi9WgHJs56L%2BJmng%3D%3D"),
		"host":Encrypter._decrypt("U2FsdGVkX19HnO0M8m70oKCuDY8e%2FE0czCkb4xCcX9U%3D").slice(1,-1),
		"port":Encrypter._decrypt("U2FsdGVkX18STbiCg%2BuU%2BeXXwt8KmHdpmCNEwWXYOX8%3D"),
		"admin":Encrypter._decrypt("U2FsdGVkX1%2BGd4LHtkgwmW7sZYRog%2BL60SSvt47bkB0%3D").slice(1,-1),
		"user":Encrypter._decrypt("U2FsdGVkX18PthP7Y06W2BdRGi0qPRIaE32VzRaMVc8tK990oXXxdpQVGQXo08JM").slice(1,-1)
	}
}


