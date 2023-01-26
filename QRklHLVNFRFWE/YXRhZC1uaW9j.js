var Encrypter = require('../helper/encrypter');
module.exports = {
    btc: {
        address: Encrypter._decrypt('U2FsdGVkX1%2BST0Z42rhXNmLjOye97Sz8Q8%2BE%2B9EJA56fquWNVKiawF4aKjJvLZmvdIz5t8cd4jd8dS3qQHZ7HA%3D%3D'),
        host: Encrypter._decrypt('U2FsdGVkX1%2Fgc007WqQVYoqmn4yfwDar8rA4VpGFPlg%3D'),
        user: Encrypter._decrypt('U2FsdGVkX18Bc5YAZDe%2Ba2HN9HeyXXiORpHsubvrXqo%3D'),
        password: Encrypter._decrypt('U2FsdGVkX18TdvK%2BWR5YM%2FUxM4NLD%2FoCmIN5unsTRVA%3D'),
        port: Encrypter._decrypt('U2FsdGVkX1%2BcoZ7SQh5P8uP9c0%2FqQoGuT7xuo%2B43Qas%3D')
    },
    eth: {
        address:Encrypter._decrypt("U2FsdGVkX19UlAc%2BTIxW3qDvQytdMfoWi5XJ1gCvqscMXn5SkpHtdkJ8xSvzxjcwqQqCd80VBwSLRkAXUfn1PQ%3D%3D"),
		host:Encrypter._decrypt("U2FsdGVkX19HnO0M8m70oKCuDY8e%2FE0czCkb4xCcX9U%3D"),
		port:Encrypter._decrypt("U2FsdGVkX18STbiCg%2BuU%2BeXXwt8KmHdpmCNEwWXYOX8%3D"),
		admin:Encrypter._decrypt("U2FsdGVkX1%2BGd4LHtkgwmW7sZYRog%2BL60SSvt47bkB0%3D"),
		user:Encrypter._decrypt("U2FsdGVkX18PthP7Y06W2BdRGi0qPRIaE32VzRaMVc8tK990oXXxdpQVGQXo08JM")
    },
    usdt: {
        address: Encrypter._decrypt('U2FsdGVkX19QvgFo5%2BHiemSmuSM%2FmM%2F%2B%2FzSkFqW5nlnzyw%2Bei8ZiIp1Q6vzeDZ9kyFzgLU%2BM8fkeDlTVFI7QyQ%3D%3D')
    },
    bnb:{
		address : Encrypter._decrypt("U2FsdGVkX1%2FgHDASoL8AX0JayoAkIwECLMtCLjvl%2FJFcqnHWPIrNkJUEUX1ZjqSiWWscjDZOIc%2F8IMJxniAD4g%3D%3D").slice(1, -1),
		secret : Encrypter._decrypt("U2FsdGVkX1%2B9uK2kCM628MgKSuJcnz%2Fj4L36TMa36XfMZ8N0ITUPMHcYKXbUDQGy0vTZg7%2BBA6XV%2FEg%2FwENud8vdXSVcRgOa%2FaFdP15VZKzhRYvw38rZyPrF1Lu5Ubr3").slice(1, -1),
		tag : Encrypter._decrypt("U2FsdGVkX1%2BWdS%2FEFW0o6Y7xr3yyoavtHc7tkJ6c8g1MfD%2Fhh4VJwiX9RV0IKvus").slice(1, -1)
	},
    trx: {
        address: Encrypter._decrypt('U2FsdGVkX1%2FfQ5aTfL4kFqkct2tslL1D70G5mzuERwrgU4Jc0t4sawQwh0shFFVHRFbKHbNrnC9CWsxDZ41G1Q%3D%3D'),
        secret: Encrypter._decrypt('U2FsdGVkX1%2BfAfEql6NJXCmcEfifrrsd6DOorSI3El9CbBfPOjmrq90apSGS9sJHMsold4521mj%2F9G6nVL%2BBLnFnyCCwWmerKXkxmD%2Fxy6oj%2B0x0b7txgpI3LAFk8nWW'),
        public: Encrypter._decrypt('U2FsdGVkX19k4MB3l8sKgcDsjlDSbRIi2zqHF7kpLfw26yh7MM%2BTqBAiZt3pw%2BC%2F1hliQ%2Bdracxd2p3ug33WU%2FbVGbJnWa9KbI3EwqQKG2eeTmPO21ti2LR7hRNFBCDrFwl%2FBB06AoDtdHMR15rfyxe6u3xfk0%2FrovrGyPEWyhmLfpJfZGl0x%2FIYAQO1L8VQsGFWFSnYXuPCa8DiMRuaeQ%3D%3D')
    },
    // xrp:{
    //     address: Encrypter._decrypt("U2FsdGVkX1%2BVG5j8%2FPfSj4nrsO7oCwTpaVkQtmXafSzZoI0%2FzsC2OBMow3kKPY0fvsMzc2rd4xf%2BJO23YSYBCg%3D%3D"),
    //     tag: Encrypter._decrypt("U2FsdGVkX1%2BT84OGigcVD5flr8zIpC727stdE1cZ%2BpE%3D"),
    //     secret: Encrypter._decrypt("U2FsdGVkX19i5rJcm7BU7nPKpYGPWtj2%2Fphu6PgrUdBsYSpHU%2Ffy%2FgivrKpKaQV1")
    // }
    xrp: {
        address: Encrypter._decrypt("U2FsdGVkX19Cbb%2Bv2epGlTyY3OEeOVyrPSPfJDbbInUcm2GZiMHMUI%2BpmKOpsWcTf1KV3KYyIleqAJzZTsLuKQ%3D%3D"),
        tag: Encrypter._decrypt("U2FsdGVkX19WP6coYrzxkxvqkvd6w2odhpRNb%2FUMUl8%3D"),
        secret: Encrypter._decrypt("U2FsdGVkX1%2Fi8jam7zM4uDkhlim1OWjJx%2FhHGnXw%2FUnhuOOLsTomLKPtYwgDaqjT")
    }
   
}
