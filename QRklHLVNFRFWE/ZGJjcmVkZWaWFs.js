var DB_ENC = require('simple-encryptor')(process.env.ENCR_KEY_DB),
    API_ENC = require('simple-encryptor')(process.env.ENCR_API_KEY);
module.exports = {
    demo_db: {
        user: DB_ENC.decrypt('64078fdd654377060dce54b68646e912bc92044fdbaad68567d85178c8d2def6dfbc87da97174e8a6ef29a7881a17ef5Ik5DOclaDHVNCy5PGgbGtkdSN+mjQo0t95SEsCGQD94xoKCBZAwUpOZDLr1DhMYv'),
        pass: DB_ENC.decrypt('e7365c6a1265215e7c49147fa84ffa26ba4445cb9bed8ad4d32c794e25d7e39b02da50c948605bfcfd779b0deec4d50dzlSzP/7XTNcA4qWcd2CopWdIm9LFLQsbgvJNoCY+9P4='),
        host: DB_ENC.decrypt('bbae583866e107a621c212e03407af936023d07e3c0a5311ea66547f9ee5265f492bdeec0b071c1ee9753d57ea9cc68c1LTgidVLIJTEdmX9uE5fwQ=='),
        port: DB_ENC.decrypt('25e4ebea39b71084d61c94164f6498d007d14a73533fd841bc69cf946879ca803ee842b49858d6247c84e7221cb7b54f/r5nAZ5hyZQYSyO1Ar5vqg=='),
        name: DB_ENC.decrypt('178272f12b8c2b4e3c292fe9ce554fe882cf11975657abb66a577bbc0b709ab0773002b17b0cb3c587dbfe83ea54eeefEwn+nwkwmgJrP+GQ0HC1Nd5IRqjrNXVMaG1ybFYIz6w=')
    },
    demo_db1:{
        user: DB_ENC.decrypt('a031d8cde3e4eab9a9ef1a662649ebda08462bb1746980c87ba7e564b0d69c70b58f1891ddebfa5e1f5d682129933029EwrQcOXx840HEbtRl3DsC8P0n3GJguFAnQ6qnAHM4Ao='),
        pass: DB_ENC.decrypt('0e4e56e2a4a287bc63eb917e27f3c1acb6d39eb10d3d75d3cc090ec1bb7a9f85ed897e24d39a8d9bf5cdc8256247dad8QqlaBiD2ncsMuhprGmGdnCvHvGsizPgRN0pQAJneYhg='),
        host: DB_ENC.decrypt('9c523ef5a284d10ab1152b52922944457f3741f98817530ce5d15b24a59277a10f7b3b48025ee8fc584688bdbe254ebeTMTiudg7jrUHgv+YrueeEQ=='),
        port: DB_ENC.decrypt('a287c0b729ebdb53164047500efe9cb6835fff50c57896d585c195c7ed22779dca47758bc4fc0c247b14320d83fa7f19J8PclZ0bvinlhjHdtWFQmQ=='),
        name: DB_ENC.decrypt('5c4af926477d493c6701961a7852eb381f6e727ad2fc39128e93081335509c9ef867fa115cc433059d94586166664d56ccfc6soVon32VDC4F0IMwp1EKjC9DJiaxsMND8Ij24E=')
    }
}
