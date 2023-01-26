var speakeasy = require("speakeasy"),
	request = require('request'),
	cron = require('node-cron'),
	qrcode = require('qrcode');

var site_data = { sitename: 'Mradhul Exchange' };
var All_Coin = { "ftx-token": { "usd": 32.77, "idr": 472878, "twd": 910.54, "eur": 27.42, "krw": 37093, "jpy": 3625.94, "rub": 2379.34, "cny": 210.78, "aed": 120.36, "ars": 3122.66, "aud": 43.1, "bdt": 2778.87, "bhd": 12.35, "bmd": 32.77, "brl": 165.67, "cad": 40.36, "chf": 29.95, "clp": 23927, "czk": 698.97, "dkk": 203.91, "gbp": 23.44, "hkd": 254.41, "huf": 9701.94, "ils": 106.75, "inr": 2423.49, "kwd": 9.87, "lkr": 6504.46, "mmk": 53936, "mxn": 669.76, "myr": 135.66, "ngn": 13516.83, "nok": 278.69, "nzd": 46.46, "php": 1585.58, "pkr": 5126.57, "pln": 124.22, "sar": 122.88, "sek": 279.31, "sgd": 43.86, "thb": 1028.91, "try": 282.82, "uah": 887.24, "vef": 3.28, "vnd": 762384, "zar": 460.82, "xdr": 22.89 }, "bitcoin": { "usd": 39373, "idr": 568188053, "twd": 1094066, "eur": 32943, "krw": 44569155, "jpy": 4356755, "rub": 2858903, "cny": 253264, "aed": 144615, "ars": 3752047, "aud": 51784, "bdt": 3338966, "bhd": 14841.93, "bmd": 39373, "brl": 199056, "cad": 48490, "chf": 35987, "clp": 28749911, "czk": 839850, "dkk": 245012, "gbp": 28165, "hkd": 305691, "huf": 11657398, "ils": 128261, "inr": 2911958, "kwd": 11857.81, "lkr": 7815461, "mmk": 64807427, "mxn": 804755, "myr": 163003, "ngn": 16241197, "nok": 334862, "nzd": 55824, "php": 1905161, "pkr": 6159843, "pln": 149262, "sar": 147653, "sek": 335609, "sgd": 52696, "thb": 1236286, "try": 339825, "uah": 1066063, "vef": 3942.38, "vnd": 916045350, "zar": 553701, "xdr": 27499 }, "ethereum": { "usd": 2443.28, "idr": 35259041, "twd": 67893, "eur": 2044.3, "krw": 2765749, "jpy": 270359, "rub": 177410, "cny": 15716.37, "aed": 8974.12, "ars": 232834, "aud": 3213.5, "bdt": 207200, "bhd": 921.02, "bmd": 2443.28, "brl": 12352.47, "cad": 3009.08, "chf": 2233.15, "clp": 1784082, "czk": 52117, "dkk": 15204.27, "gbp": 1747.79, "hkd": 18969.71, "huf": 723403, "ils": 7959.29, "inr": 180702, "kwd": 735.84, "lkr": 484990, "mmk": 4021640, "mxn": 49939, "myr": 10115.16, "ngn": 1007851, "nok": 20780, "nzd": 3464.2, "php": 118225, "pkr": 382250, "pln": 9262.49, "sar": 9162.62, "sek": 20826, "sgd": 3270.08, "thb": 76718, "try": 21088, "uah": 66155, "vef": 244.65, "vnd": 56845406, "zar": 34360, "xdr": 1706.45 }, "bitcoin-cash": { "usd": 620.04, "idr": 8947896, "twd": 17229.49, "eur": 518.79, "krw": 701881, "jpy": 68611, "rub": 45022, "cny": 3988.44, "aed": 2277.41, "ars": 59088, "aud": 815.51, "bdt": 52582, "bhd": 233.73, "bmd": 620.04, "brl": 3134.76, "cad": 763.63, "chf": 566.72, "clp": 452757, "czk": 13226.06, "dkk": 3858.48, "gbp": 443.55, "hkd": 4814.06, "huf": 183582, "ils": 2019.88, "inr": 45858, "kwd": 186.74, "lkr": 123079, "mmk": 1020595, "mxn": 12673.38, "myr": 2566.98, "ngn": 255768, "nok": 5273.45, "nzd": 879.13, "php": 30003, "pkr": 97006, "pln": 2350.6, "sar": 2325.25, "sek": 5285.22, "sgd": 829.87, "thb": 19469.19, "try": 5351.6, "uah": 16788.5, "vef": 62.09, "vnd": 14425996, "zar": 8719.75, "xdr": 433.06 }, "binancecoin": { "usd": 359.51, "idr": 5188119, "twd": 9989.91, "eur": 300.8, "krw": 406960, "jpy": 39781, "rub": 26105, "cny": 2312.55, "aed": 1320.48, "ars": 34260, "aud": 472.84, "bdt": 30488, "bhd": 135.52, "bmd": 359.51, "brl": 1817.58, "cad": 442.77, "chf": 328.59, "clp": 262515, "czk": 7668.66, "dkk": 2237.2, "gbp": 257.18, "hkd": 2791.26, "huf": 106444, "ils": 1171.15, "inr": 26589, "kwd": 108.27, "lkr": 71363, "mmk": 591756, "mxn": 7348.21, "myr": 1488.37, "ngn": 148298, "nok": 3057.62, "nzd": 509.73, "php": 17396.01, "pkr": 56245, "pln": 1362.91, "sar": 1348.21, "sek": 3064.45, "sgd": 481.17, "thb": 11288.52, "try": 3102.94, "uah": 9734.21, "vef": 36.0, "vnd": 8364400, "zar": 5055.84, "xdr": 251.09 }, "usd-coin": { "usd": 1.0, "idr": 14451.13, "twd": 27.83, "eur": 0.837867, "krw": 1133.56, "jpy": 110.81, "rub": 72.71, "cny": 6.44, "aed": 3.68, "ars": 95.43, "aud": 1.32, "bdt": 84.92, "bhd": 0.377485, "bmd": 1.0, "brl": 5.06, "cad": 1.23, "chf": 0.915271, "clp": 731.22, "czk": 21.36, "dkk": 6.23, "gbp": 0.716344, "hkd": 7.77, "huf": 296.49, "ils": 3.26, "inr": 74.06, "kwd": 0.301588, "lkr": 198.78, "mmk": 1648.29, "mxn": 20.47, "myr": 4.15, "ngn": 413.07, "nok": 8.52, "nzd": 1.42, "php": 48.46, "pkr": 156.67, "pln": 3.8, "sar": 3.76, "sek": 8.54, "sgd": 1.34, "thb": 31.44, "try": 8.64, "uah": 27.11, "vef": 0.100269, "vnd": 23298, "zar": 14.08, "xdr": 0.699401 }, "binance-usd": { "usd": 1.0, "idr": 14449.58, "twd": 27.82, "eur": 0.837777, "krw": 1133.44, "jpy": 110.8, "rub": 72.7, "cny": 6.44, "aed": 3.68, "ars": 95.42, "aud": 1.32, "bdt": 84.91, "bhd": 0.377445, "bmd": 1.0, "brl": 5.06, "cad": 1.23, "chf": 0.915173, "clp": 731.14, "czk": 21.36, "dkk": 6.23, "gbp": 0.716267, "hkd": 7.77, "huf": 296.46, "ils": 3.26, "inr": 74.05, "kwd": 0.301556, "lkr": 198.75, "mmk": 1648.12, "mxn": 20.47, "myr": 4.15, "ngn": 413.03, "nok": 8.52, "nzd": 1.42, "php": 48.45, "pkr": 156.65, "pln": 3.8, "sar": 3.75, "sek": 8.53, "sgd": 1.34, "thb": 31.44, "try": 8.64, "uah": 27.11, "vef": 0.100259, "vnd": 23296, "zar": 14.08, "xdr": 0.699326 }, "matic-network": { "usd": 1.55, "idr": 22300, "twd": 42.94, "eur": 1.29, "krw": 1749.24, "jpy": 170.99, "rub": 112.21, "cny": 9.94, "aed": 5.68, "ars": 147.26, "aud": 2.03, "bdt": 131.05, "bhd": 0.582514, "bmd": 1.55, "brl": 7.81, "cad": 1.9, "chf": 1.41, "clp": 1128.37, "czk": 32.96, "dkk": 9.62, "gbp": 1.11, "hkd": 12.0, "huf": 457.53, "ils": 5.03, "inr": 114.29, "kwd": 0.465394, "lkr": 306.74, "mmk": 2543.55, "mxn": 31.58, "myr": 6.4, "ngn": 637.43, "nok": 13.14, "nzd": 2.19, "php": 74.77, "pkr": 241.76, "pln": 5.86, "sar": 5.8, "sek": 13.17, "sgd": 2.07, "thb": 48.52, "try": 13.34, "uah": 41.84, "vef": 0.15473, "vnd": 35953, "zar": 21.73, "xdr": 1.08 }, "dai": { "usd": 1.0, "idr": 14438.54, "twd": 27.85, "eur": 0.838833, "krw": 1134.24, "jpy": 110.89, "rub": 72.77, "cny": 6.45, "aed": 3.68, "ars": 95.52, "aud": 1.32, "bdt": 84.99, "bhd": 0.377763, "bmd": 1.0, "brl": 5.07, "cad": 1.23, "chf": 0.915672, "clp": 731.82, "czk": 21.38, "dkk": 6.24, "gbp": 0.717063, "hkd": 7.78, "huf": 296.79, "ils": 3.27, "inr": 74.19, "kwd": 0.30188, "lkr": 198.94, "mmk": 1649.65, "mxn": 20.5, "myr": 4.15, "ngn": 413.41, "nok": 8.54, "nzd": 1.42, "php": 48.5, "pkr": 156.8, "pln": 3.8, "sar": 3.76, "sek": 8.54, "sgd": 1.34, "thb": 31.47, "try": 8.66, "uah": 27.14, "vef": 0.100352, "vnd": 23323, "zar": 14.1, "xdr": 0.699978 }, "chainlink": { "usd": 24.23, "idr": 349734, "twd": 673.43, "eur": 20.28, "krw": 27433, "jpy": 2681.69, "rub": 1759.73, "cny": 155.89, "aed": 89.01, "ars": 2309.48, "aud": 31.87, "bdt": 2055.22, "bhd": 9.14, "bmd": 24.23, "brl": 122.52, "cad": 29.85, "chf": 22.15, "clp": 17696.29, "czk": 516.95, "dkk": 150.81, "gbp": 17.34, "hkd": 188.16, "huf": 7175.42, "ils": 78.95, "inr": 1792.38, "kwd": 7.3, "lkr": 4810.61, "mmk": 39891, "mxn": 495.35, "myr": 100.33, "ngn": 9996.86, "nok": 206.12, "nzd": 34.36, "php": 1172.67, "pkr": 3791.54, "pln": 91.87, "sar": 90.88, "sek": 206.58, "sgd": 32.44, "thb": 760.97, "try": 209.17, "uah": 656.19, "vef": 2.43, "vnd": 563849, "zar": 340.82, "xdr": 16.93 }, "tether": { "usd": 1.0, "idr": 14432.43, "twd": 27.84, "eur": 0.838478, "krw": 1133.76, "jpy": 110.85, "rub": 72.74, "cny": 6.44, "aed": 3.68, "ars": 95.48, "aud": 1.32, "bdt": 84.96, "bhd": 0.377603, "bmd": 1.0, "brl": 5.07, "cad": 1.23, "chf": 0.915285, "clp": 731.51, "czk": 21.37, "dkk": 6.24, "gbp": 0.716759, "hkd": 7.78, "huf": 296.66, "ils": 3.27, "inr": 74.16, "kwd": 0.301752, "lkr": 198.86, "mmk": 1648.96, "mxn": 20.49, "myr": 4.15, "ngn": 413.24, "nok": 8.53, "nzd": 1.42, "php": 48.48, "pkr": 156.73, "pln": 3.8, "sar": 3.76, "sek": 8.54, "sgd": 1.34, "thb": 31.46, "try": 8.65, "uah": 27.12, "vef": 0.10031, "vnd": 23313, "zar": 14.1, "xdr": 0.699682 }, "ethereum-classic": { "usd": 56.64, "idr": 817364, "twd": 1573.86, "eur": 47.39, "krw": 64115, "jpy": 6267.39, "rub": 4112.66, "cny": 364.33, "aed": 208.04, "ars": 5397.49, "aud": 74.49, "bdt": 4803.25, "bhd": 21.35, "bmd": 56.64, "brl": 286.35, "cad": 69.76, "chf": 51.77, "clp": 41358, "czk": 1208.16, "dkk": 352.46, "gbp": 40.52, "hkd": 439.75, "huf": 16769.69, "ils": 184.51, "inr": 4188.98, "kwd": 17.06, "lkr": 11242.89, "mmk": 93228, "mxn": 1157.68, "myr": 234.49, "ngn": 23364, "nok": 481.71, "nzd": 80.31, "php": 2740.66, "pkr": 8861.21, "pln": 214.72, "sar": 212.4, "sek": 482.79, "sgd": 75.81, "thb": 1778.45, "try": 488.85, "uah": 1533.58, "vef": 5.67, "vnd": 1317772, "zar": 796.52, "xdr": 39.56 }, "dogecoin": { "usd": 0.312611, "idr": 4511.3, "twd": 8.69, "eur": 0.261562, "krw": 353.87, "jpy": 34.59, "rub": 22.7, "cny": 2.01, "aed": 1.15, "ars": 29.79, "aud": 0.411159, "bdt": 26.51, "bhd": 0.117842, "bmd": 0.312611, "brl": 1.58, "cad": 0.385004, "chf": 0.285726, "clp": 228.27, "czk": 6.67, "dkk": 1.95, "gbp": 0.223626, "hkd": 2.43, "huf": 92.56, "ils": 1.02, "inr": 23.12, "kwd": 0.094149, "lkr": 62.05, "mmk": 514.56, "mxn": 6.39, "myr": 1.29, "ngn": 128.95, "nok": 2.66, "nzd": 0.443235, "php": 15.13, "pkr": 48.91, "pln": 1.19, "sar": 1.17, "sek": 2.66, "sgd": 0.418398, "thb": 9.82, "try": 2.7, "uah": 8.46, "vef": 0.03130171, "vnd": 7273.22, "zar": 4.4, "xdr": 0.218336 }, "stellar": { "usd": 0.329249, "idr": 4751.41, "twd": 9.15, "eur": 0.275484, "krw": 372.7, "jpy": 36.43, "rub": 23.91, "cny": 2.12, "aed": 1.21, "ars": 31.38, "aud": 0.433042, "bdt": 27.92, "bhd": 0.124114, "bmd": 0.329249, "brl": 1.66, "cad": 0.405496, "chf": 0.300933, "clp": 240.42, "czk": 7.02, "dkk": 2.05, "gbp": 0.235528, "hkd": 2.56, "huf": 97.48, "ils": 1.07, "inr": 24.35, "kwd": 0.09916, "lkr": 65.36, "mmk": 541.94, "mxn": 6.73, "myr": 1.36, "ngn": 135.82, "nok": 2.8, "nzd": 0.466826, "php": 15.93, "pkr": 51.51, "pln": 1.25, "sar": 1.23, "sek": 2.81, "sgd": 0.440667, "thb": 10.34, "try": 2.84, "uah": 8.91, "vef": 0.03296769, "vnd": 7660.32, "zar": 4.63, "xdr": 0.229957 }, "tron": { "usd": 0.071739, "idr": 1035.27, "twd": 1.99, "eur": 0.060024, "krw": 81.21, "jpy": 7.94, "rub": 5.21, "cny": 0.46146, "aed": 0.263496, "ars": 6.84, "aud": 0.094354, "bdt": 6.08, "bhd": 0.02704274, "bmd": 0.071739, "brl": 0.36269, "cad": 0.088352, "chf": 0.065569, "clp": 52.38, "czk": 1.53, "dkk": 0.446424, "gbp": 0.051318, "hkd": 0.556984, "huf": 21.24, "ils": 0.233698, "inr": 5.31, "kwd": 0.02160551, "lkr": 14.24, "mmk": 118.08, "mxn": 1.47, "myr": 0.296999, "ngn": 29.59, "nok": 0.610135, "nzd": 0.101715, "php": 3.47, "pkr": 11.22, "pln": 0.271963, "sar": 0.26903, "sek": 0.611497, "sgd": 0.096015, "thb": 2.25, "try": 0.619178, "uah": 1.94, "vef": 0.00718321, "vnd": 1669.08, "zar": 1.01, "xdr": 0.050104 }, "eos": { "usd": 5.06, "idr": 73082, "twd": 140.72, "eur": 4.24, "krw": 5732.61, "jpy": 560.38, "rub": 367.72, "cny": 32.58, "aed": 18.6, "ars": 482.6, "aud": 6.66, "bdt": 429.47, "bhd": 1.91, "bmd": 5.06, "brl": 25.6, "cad": 6.24, "chf": 4.63, "clp": 3697.89, "czk": 108.02, "dkk": 31.51, "gbp": 3.62, "hkd": 39.32, "huf": 1499.41, "ils": 16.5, "inr": 374.54, "kwd": 1.53, "lkr": 1005.25, "mmk": 8335.71, "mxn": 103.51, "myr": 20.97, "ngn": 2088.99, "nok": 43.07, "nzd": 7.18, "php": 245.05, "pkr": 792.3, "pln": 19.2, "sar": 18.99, "sek": 43.17, "sgd": 6.78, "thb": 159.01, "try": 43.71, "uah": 137.12, "vef": 0.50708, "vnd": 117824, "zar": 71.22, "xdr": 3.54 }, "ripple": { "usd": 0.857062, "idr": 12368.31, "twd": 23.82, "eur": 0.717107, "krw": 970.18, "jpy": 94.84, "rub": 62.23, "cny": 5.51, "aed": 3.15, "ars": 81.67, "aud": 1.13, "bdt": 72.68, "bhd": 0.323079, "bmd": 0.857062, "brl": 4.33, "cad": 1.06, "chf": 0.783355, "clp": 625.83, "czk": 18.28, "dkk": 5.33, "gbp": 0.613099, "hkd": 6.65, "huf": 253.76, "ils": 2.79, "inr": 63.39, "kwd": 0.258121, "lkr": 170.13, "mmk": 1410.73, "mxn": 17.52, "myr": 3.55, "ngn": 353.54, "nok": 7.29, "nzd": 1.22, "php": 41.47, "pkr": 134.09, "pln": 3.25, "sar": 3.21, "sek": 7.31, "sgd": 1.15, "thb": 26.91, "try": 7.4, "uah": 23.21, "vef": 0.085818, "vnd": 19940.47, "zar": 12.05, "xdr": 0.598597 }, "wrapped-bitcoin": { "usd": 39319, "idr": 567421413, "twd": 1092590, "eur": 32899, "krw": 44509020, "jpy": 4350877, "rub": 2855046, "cny": 252923, "aed": 144420, "ars": 3746985, "aud": 51715, "bdt": 3334461, "bhd": 14821.91, "bmd": 39319, "brl": 198787, "cad": 48425, "chf": 35938, "clp": 28711120, "czk": 838716, "dkk": 244681, "gbp": 28127, "hkd": 305278, "huf": 11641669, "ils": 128088, "inr": 2908029, "kwd": 11841.81, "lkr": 7804916, "mmk": 64719984, "mxn": 803669, "myr": 162783, "ngn": 16219283, "nok": 334410, "nzd": 55749, "php": 1902591, "pkr": 6151532, "pln": 149061, "sar": 147453, "sek": 335157, "sgd": 52625, "thb": 1234618, "try": 339366, "uah": 1064625, "vef": 3937.06, "vnd": 914809358, "zar": 552954, "xdr": 27462 }, "litecoin": { "usd": 172.15, "idr": 2484334, "twd": 4783.67, "eur": 144.04, "krw": 194873, "jpy": 19049.39, "rub": 12500.21, "cny": 1107.37, "aed": 632.31, "ars": 16405.38, "aud": 226.42, "bdt": 14599.23, "bhd": 64.89, "bmd": 172.15, "brl": 870.35, "cad": 212.02, "chf": 157.35, "clp": 125706, "czk": 3672.14, "dkk": 1071.28, "gbp": 123.15, "hkd": 1336.6, "huf": 50971, "ils": 560.81, "inr": 12732.19, "kwd": 51.85, "lkr": 34172, "mmk": 283363, "mxn": 3518.69, "myr": 712.71, "ngn": 71013, "nok": 1464.14, "nzd": 244.09, "php": 8330.09, "pkr": 26933, "pln": 652.63, "sar": 645.59, "sek": 1467.41, "sgd": 230.41, "thb": 5405.51, "try": 1485.84, "uah": 4661.23, "vef": 17.24, "vnd": 4005298, "zar": 2420.99, "xdr": 120.24 }, "vechain": { "usd": 0.110629, "idr": 1596.49, "twd": 3.07, "eur": 0.092564, "krw": 125.23, "jpy": 12.24, "rub": 8.03, "cny": 0.711621, "aed": 0.406339, "ars": 10.54, "aud": 0.145504, "bdt": 9.38, "bhd": 0.04170281, "bmd": 0.110629, "brl": 0.559307, "cad": 0.136248, "chf": 0.101115, "clp": 80.78, "czk": 2.36, "dkk": 0.688433, "gbp": 0.079138, "hkd": 0.858929, "huf": 32.75, "ils": 0.360388, "inr": 8.18, "kwd": 0.03331802, "lkr": 21.96, "mmk": 182.1, "mxn": 2.26, "myr": 0.458004, "ngn": 45.63, "nok": 0.940894, "nzd": 0.156855, "php": 5.35, "pkr": 17.31, "pln": 0.419396, "sar": 0.414874, "sek": 0.942994, "sgd": 0.148066, "thb": 3.47, "try": 0.954839, "uah": 3.0, "vef": 0.01107728, "vnd": 2573.9, "zar": 1.56, "xdr": 0.077266 }, "uniswap": { "usd": 22.78, "idr": 328703, "twd": 632.93, "eur": 19.06, "krw": 25784, "jpy": 2520.43, "rub": 1653.91, "cny": 146.52, "aed": 83.66, "ars": 2170.6, "aud": 29.96, "bdt": 1931.63, "bhd": 8.59, "bmd": 22.78, "brl": 115.16, "cad": 28.05, "chf": 20.82, "clp": 16632.15, "czk": 485.86, "dkk": 141.74, "gbp": 16.29, "hkd": 176.85, "huf": 6743.94, "ils": 74.2, "inr": 1684.6, "kwd": 6.86, "lkr": 4521.33, "mmk": 37492, "mxn": 465.56, "myr": 94.3, "ngn": 9395.71, "nok": 193.72, "nzd": 32.3, "php": 1102.16, "pkr": 3563.54, "pln": 86.35, "sar": 85.42, "sek": 194.15, "sgd": 30.49, "thb": 715.21, "try": 196.59, "uah": 616.73, "vef": 2.28, "vnd": 529943, "zar": 320.32, "xdr": 15.91 }, "aave": { "usd": 302.8, "idr": 4369785, "twd": 8414.17, "eur": 253.36, "krw": 342770, "jpy": 33507, "rub": 21987, "cny": 1947.79, "aed": 1112.2, "ars": 28856, "aud": 398.26, "bdt": 25679, "bhd": 114.15, "bmd": 302.8, "brl": 1530.89, "cad": 372.93, "chf": 276.76, "clp": 221108, "czk": 6459.06, "dkk": 1884.32, "gbp": 216.61, "hkd": 2350.99, "huf": 89654, "ils": 986.42, "inr": 22395, "kwd": 91.2, "lkr": 60107, "mmk": 498417, "mxn": 6189.16, "myr": 1253.61, "ngn": 124907, "nok": 2575.34, "nzd": 429.33, "php": 14652.09, "pkr": 47374, "pln": 1147.94, "sar": 1135.56, "sek": 2581.08, "sgd": 405.27, "thb": 9507.95, "try": 2613.5, "uah": 8198.81, "vef": 30.32, "vnd": 7045063, "zar": 4258.37, "xdr": 211.49 }, "maker": { "usd": 3046.54, "idr": 43964803, "twd": 84656, "eur": 2549.05, "krw": 3448637, "jpy": 337114, "rub": 221214, "cny": 19596.88, "aed": 11189.9, "ars": 290323, "aud": 4006.94, "bdt": 258360, "bhd": 1148.43, "bmd": 3046.54, "brl": 15402.4, "cad": 3752.05, "chf": 2784.54, "clp": 2224588, "czk": 64985, "dkk": 18958.33, "gbp": 2179.34, "hkd": 23654, "huf": 902017, "ils": 9924.5, "inr": 225319, "kwd": 917.52, "lkr": 604739, "mmk": 5014618, "mxn": 62270, "myr": 12612.68, "ngn": 1256698, "nok": 25911, "nzd": 4319.54, "php": 147416, "pkr": 476631, "pln": 11549.48, "sar": 11424.95, "sek": 25969, "sgd": 4077.49, "thb": 95660, "try": 26295, "uah": 82489, "vef": 305.05, "vnd": 70881029, "zar": 42844, "xdr": 2127.79 } };

var default_gasPrice = {
	"LastBlock": "12470793",
	"SafeGasPrice": "9",
	"ProposeGasPrice": "16",
	"FastGasPrice": "21"
};

cron.schedule('*/10 * * * *', () => {
	update_inr_value()
})

async function update_inr_value() {
	var currency = require('../model/currency');
	var coin_datas = await currency.find({ status: true, symbol: { $nin: ['usd'] } }).exec()
	var coin_ids = coin_datas.map(e => { return e.id });
	var avail_currency = ['usd', 'idr', 'twd', 'eur', 'krw', 'jpy', 'rub', 'cny', 'aed', 'ars', 'aud', 'bdt', 'bhd', 'bmd', 'brl', 'cad', 'chf', 'clp', 'czk', 'dkk', 'gbp', 'hkd', 'huf', 'ils', 'inr', 'kwd', 'lkr', 'mmk', 'mxn', 'myr', 'ngn', 'nok', 'nzd', 'php', 'pkr', 'pln', 'sar', 'sek', 'sgd', 'thb', 'try', 'uah', 'vef', 'vnd', 'zar', 'xdr'];
	request(`https://api.coingecko.com/api/v3/simple/price?ids=${ coin_ids.join().trim().replace(/,/g, '%2C') }&vs_currencies=${ avail_currency.join().trim().replace(/,/g, '%2C') }`, (error, response, body) => {
		if (body) {
			body = JSON.parse(body)
			All_Coin = body;
			return;
		}
	})
}

module.exports = {
	generate_tfa: async function (email, callback) {
		var data = { issuer: site_data.sitename, name: `${ site_data.sitename } (${ email })`, length: 10 };
		var secret = await speakeasy.generateSecret(data);
		var url = speakeasy.otpauthURL({ secret: secret.base32, label: email, issuer: site_data.sitename, encoding: 'base32' })
		qrcode.toDataURL(url, (err, dataURL) => {
			if (dataURL)
				callback(null, { tempSecret: secret.base32, dataURL: dataURL, otpURL: secret.otpauth_url, status: false })
			else
				callback(err, null)
		})
	},

	verify_tfa: async function (code, secret, callback) {
		var verified = await speakeasy.totp.verify({ secret: secret, encoding: 'base32', token: code });
		callback(verified)
	},

	_conversion_value: async function (id) {
		return All_Coin[id.toLowerCase()]['usd'];
	},

	_get_priceList: async function (cb) {
		//console.log('cb---->',cb)
		cb({ data: All_Coin });
		//console.log('All_Coin---->',All_Coin)
	},

	_gas_price: async function (cb) {
		var options = {
			url: `https://api.etherscan.io/api`,
			method: 'GET',
			headers: { "Content-Type": "application/json" },
			qs: {
				"module": "gastracker",
				"action": "gasoracle",
				"apikey": "FEBAUGJBF6NIFF1EJ98K2PR4SHYJG9AI29"
			}
		}
		request(options, (error, response, body) => {
			console.log("body in gas price", body, "error", error)
			if (body) {
				var data = JSON.parse(body);
				cb(data.result)
			} else
				cb(default_gasPrice)
		})
	},

	_get_pricelist: async function (list, vs_currency, cb) {
		request(`https://api.coingecko.com/api/v3/simple/price?ids=${ list.join().trim().replace(/,/g, '%2C') }&vs_currencies=${ vs_currency.toLowerCase() }`, (error, response, body) => {
			if (body) {
				var result = JSON.parse(body)
				cb({ status: true, data: result })
			} else
				cb({ status: false, data: {} })
		})
	},

	_get_marketData: async function (list, cb) {
		request(`https://api.coingecko.com/api/v3/coins/markets?ids=${ list.join().trim().replace(/,/g, '%2C') }&vs_currency=usd`, (error, response, body) => {
			if (body) {
				var result = JSON.parse(body)
				cb({ status: true, data: result })
			} else
				cb({ status: true, data: [] })
		})
	}
};