var Encrypter = require('../helper/encrypter');
module.exports = {
	"trx":{
		"address":Encrypter._decrypt("U2FsdGVkX1%2FfQ5aTfL4kFqkct2tslL1D70G5mzuERwrgU4Jc0t4sawQwh0shFFVHRFbKHbNrnC9CWsxDZ41G1Q%3D%3D").slice(1, -1),
		"secret":Encrypter._decrypt("U2FsdGVkX1%2BfAfEql6NJXCmcEfifrrsd6DOorSI3El9CbBfPOjmrq90apSGS9sJHMsold4521mj%2F9G6nVL%2BBLnFnyCCwWmerKXkxmD%2Fxy6oj%2B0x0b7txgpI3LAFk8nWW").slice(1, -1),
		"public":Encrypter._decrypt("U2FsdGVkX19k4MB3l8sKgcDsjlDSbRIi2zqHF7kpLfw26yh7MM%2BTqBAiZt3pw%2BC%2F1hliQ%2Bdracxd2p3ug33WU%2FbVGbJnWa9KbI3EwqQKG2eeTmPO21ti2LR7hRNFBCDrFwl%2FBB06AoDtdHMR15rfyxe6u3xfk0%2FrovrGyPEWyhmLfpJfZGl0x%2FIYAQO1L8VQsGFWFSnYXuPCa8DiMRuaeQ%3D%3D").slice(1, -1)
	}
}

