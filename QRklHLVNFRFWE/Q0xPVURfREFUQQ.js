var API_ENC = require('../helper/encrypter');

module.exports = {
    cloud: {
        buck_name: API_ENC._decrypt('U2FsdGVkX19TRASBhkjXzl6LrjezeDAyAsenlRtAFKjfo0IEz52%2BNUpAlAUMzMSi').slice(1, -1),
        key: API_ENC._decrypt('U2FsdGVkX190E0PIBEhb3iBSo5i4LKZjDJSWB8%2B4RSMqCa9ccl6v3mTKua9HTj4U').slice(1, -1),
        access_key: API_ENC._decrypt('U2FsdGVkX18%2FuloRSwiMDrBBulJqw4TN7EAJK5Mg5dSbXxSBDhWggwQugSCgGKcl83H93FKZPrId7PR3NV3YHQ%3D%3D').slice(1, -1),
        end_point: API_ENC._decrypt('U2FsdGVkX18G5ov9Fgq8aJyWJXowhuEMEcj3QiQkQKfVhlDUBBvKt30x0%2BJS6CeM').slice(1, -1)
        
        // buck_name: API_ENC._decrypt('U2FsdGVkX19%2Bkm13DbLlnv0gjDkhjsNBL5BmnjPSiyY%3D').slice(1, -1),
        // key: API_ENC._decrypt('U2FsdGVkX1%2Fkc3PU03XIHu9Gzh8Kxy%2FcnO2Gbqzg%2B5hUtvbPBijqMgJnK2n%2FC1Hm').slice(1, -1),
        // access_key: API_ENC._decrypt('U2FsdGVkX1%2B8t86ypRYKE6rgV8oe6QQOJYQkma21%2BQEOwQJzryp%2FXuoyZpdPE5kB').slice(1, -1),
        // end_point: API_ENC._decrypt('U2FsdGVkX18G5ov9Fgq8aJyWJXowhuEMEcj3QiQkQKfVhlDUBBvKt30x0%2BJS6CeM').slice(1, -1)

    }
}
