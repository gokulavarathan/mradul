var Encrypter = require('../helper/encrypter');

module.exports = {
    "xrp": {
        "address": Encrypter._decrypt("U2FsdGVkX19Cbb%2Bv2epGlTyY3OEeOVyrPSPfJDbbInUcm2GZiMHMUI%2BpmKOpsWcTf1KV3KYyIleqAJzZTsLuKQ%3D%3D"),
        "tag": Encrypter._decrypt("U2FsdGVkX19WP6coYrzxkxvqkvd6w2odhpRNb%2FUMUl8%3D"),
        "secret": Encrypter._decrypt("U2FsdGVkX1%2Fi8jam7zM4uDkhlim1OWjJx%2FhHGnXw%2FUnhuOOLsTomLKPtYwgDaqjT")
    }
}

