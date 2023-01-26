"use strict";

var version = '2.0.2';
process.env.ABCD_API_KEY = "gvHCGNQBz6N2XGmtsMno";
var http = require("https");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
var bytexcCache = {};

var bytexcCacheCleanupTime = 3 * 60 * 60 * 1000;
var bytexcKeysValidateTime = 15 * 60 * 1000;
var yahooFailedStateCacheTime = 3 * 60 * 60 * 1000;
var bytexcMinimumDate = '2019-08-01';

setInterval(function () {
	bytexcCache = {};
}, bytexcCacheCleanupTime);

function dateForLogs() {
	return (new Date()).toISOString() + ': ';
}

var defaultResponseHeader = { "Content-Type": "text/plain", 'Access-Control-Allow-Origin': '*' };

function sendJsonResponse(response, jsonData) {
	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(jsonData));
	response.end();
}

function unixTime(unixtime) {

	var u = new Date(unixtime * 1000);

	return u.getUTCFullYear() +
		'-' + ('0' + u.getUTCMonth()).slice(-2) +
		'-' + ('0' + u.getUTCDate()).slice(-2) +
		' ' + ('0' + u.getUTCHours()).slice(-2) +
		':' + ('0' + u.getUTCMinutes()).slice(-2) +
		':' + ('0' + u.getUTCSeconds()).slice(-2) //+

}


function dateToYMD(date) {
	var obj = new Date(date);
	var year = obj.getFullYear();
	var m = obj.getMonth() + 1;
	var month = m < 10 ? '0' + m : m;
	var d = obj.getDate();
	var day = d < 10 ? '0' + d : d;
	return year + "-" + month + "-" + day;
}

var abcdKeys = process.env.ABCD_API_KEY.split(',');
var invalidabcdKeys = [];

function getValidabcdKey() {
	invalidabcdKeys = [];
	for (var i = 0; i < abcdKeys.length; i++) {
		var key = abcdKeys[i];
		if (invalidabcdKeys.indexOf(key) === -1) {
			return key;
		}
	}
	return null;
}

function markabcdKeyAsInvalid(key) {
	if (invalidabcdKeys.indexOf(key) !== -1) {
		return;
	}

	invalidabcdKeys.push(key);


	setTimeout(function () {
	}, bytexcKeysValidateTime);
}

function sendError(error, response) {
	response.writeHead(200, defaultResponseHeader);
	response.write("{\"s\":\"error\",\"errmsg\":\"" + error + "\"}");
	response.end();
}

function httpGet(datafeedHost, path, callback) {
	var options = {
		host: datafeedHost,
		path: path,
		"rejectUnauthorized": false,
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		},
		strictSSL: false
	};

	function onDataCallback(response) {
		var result = '';
		response.on('data', function (chunk) {
			result += chunk;
		});
		response.on('end', function () {
			if (response.statusCode !== 200) {
				callback({
					status: 'ERR_STATUS_CODE',
					errmsg: response.statusMessage || ''
				});
				return;
			}
			callback({
				status: 'ok',
				data: result
			});
		});
	}
	var req = http.request(options, onDataCallback);
	req.on('socket', function (socket) {
		socket.setTimeout(5000);
		socket.on('timeout', function () {
			req.abort();
		});
	});
	req.on('error', function (e) {
		callback({
			status: 'ERR_SOCKET',
			errmsg: e.message || ''
		});
	});
	req.end();
}

function convertabcdHistoryToUDFFormat(data) {

	function parseDate(input) {
		var parts = input.split('-');
		return Date.UTC(parts[0], parts[1] - 1, parts[2]);
	}

	function formatDate(dateInput) {
		var date = dateInput.split("-");
		return date[0] + "-" + date[1] + "-" + date[2].substring(0, 2);
	}

	function columnIndices(columns) {
		var indices = {};
		for (var i = 0; i < columns.length; i++) {
			indices[columns[i].name] = i;
		}

		return indices;
	}

	var result = {
		t: [],
		c: [],
		o: [],
		h: [],
		l: [],
		v: [],
		s: "ok"
	};

	try {
		var json = JSON.parse(data);
		json.forEach(function (row) {
			var fi = dateToYMD(formatDate(row.Date));
			result.t.push(parseDate(fi) / 1000);
			result.o.push(row.open);
			result.h.push(row.high);
			result.l.push(row.low);
			result.c.push(row.close);
			result.v.push(row.volume);
		});

	} catch (error) {
		return null;
	}

	return result;
}

function convertYahooQuotesToUDFFormat(tickersMap, data) {
	if (!data.query || !data.query.results) {
		var errmsg = "ERROR: empty quotes response: " + JSON.stringify(data);
		return {
			s: "error",
			errmsg: errmsg
		};
	}

	var result = {
		s: "ok",
		d: []
	};

	[].concat(data.query.results.quote).forEach(function (quote) {
		var ticker = tickersMap[quote.symbol];

		if (quote["ErrorIndicationreturnedforsymbolchangedinvalid"] || !quote.StockExchange) {
			result.d.push({
				s: "error",
				n: ticker,
				v: {}
			});
			return;
		}

		result.d.push({
			s: "ok",
			n: ticker,
			v: {
				ch: +(quote.ChangeRealtime || quote.Change),
				chp: +((quote.PercentChange || quote.ChangeinPercent) && (quote.PercentChange || quote.ChangeinPercent).replace(/[+-]?(.*)%/, "$1")),

				short_name: quote.Symbol,
				exchange: quote.StockExchange,
				original_name: quote.StockExchange + ":" + quote.Symbol,
				description: quote.Name,

				lp: +quote.LastTradePriceOnly,
				ask: +quote.AskRealtime,
				bid: +quote.BidRealtime,

				open_price: +quote.Open,
				high_price: +quote.DaysHigh,
				low_price: +quote.DaysLow,
				prev_close_price: +quote.PreviousClose,
				volume: +quote.Volume,
			}
		});
	});
	return result;
}

function proxyRequest(controller, options, response) {
	controller.request(options, function (res) {
		var result = '';

		res.on('data', function (chunk) {
			result += chunk;
		});

		res.on('end', function () {
			if (res.statusCode !== 200) {
				response.writeHead(200, defaultResponseHeader);
				response.write(JSON.stringify({
					s: 'error',
					errmsg: 'Failed to get news'
				}));
				response.end();
				return;
			}
			response.writeHead(200, defaultResponseHeader);
			response.write(result);
			response.end();
		});
	}).end();
}

function RequestProcessor(symbolsDatabase) {
	this._symbolsDatabase = symbolsDatabase;
	this._failedYahooTime = {};
}

function filterDataPeriod(data, fromSeconds, toSeconds) {
	if (!data || !data.t) {
		return data;
	}

	if (data.t[data.t.length - 1] < fromSeconds) {
		return {
			s: 'no_data',
			nextTime: data.t[data.t.length - 1]
		};
	}

	var fromIndex = null;
	var toIndex = null;
	var times = data.t;
	for (var i = 0; i < times.length; i++) {
		var time = times[i];
		if (fromIndex === null && time >= fromSeconds) {
			fromIndex = i;
		}
		if (toIndex === null && time >= toSeconds) {
			toIndex = time > toSeconds ? i - 1 : i;
		}
		if (fromIndex !== null && toIndex !== null) {
			break;
		}
	}

	fromIndex = fromIndex || 0;
	toIndex = toIndex ? toIndex + 1 : times.length;

	var s = data.s;

	if (toSeconds < times[0]) {
		s = 'no_data';
	}

	toIndex = Math.min(fromIndex + 1000, toIndex);

	return {
		t: data.t.slice(fromIndex, toIndex),
		o: data.o.slice(fromIndex, toIndex),
		h: data.h.slice(fromIndex, toIndex),
		l: data.l.slice(fromIndex, toIndex),
		c: data.c.slice(fromIndex, toIndex),
		v: data.v.slice(fromIndex, toIndex),
		s: s
	};
}

RequestProcessor.prototype._sendConfig = function (response) {

	var config = {
		supports_search: true,
		supports_group_request: false,
		supports_marks: true,
		supports_timescale_marks: true,
		supports_time: true,
		exchanges: [{
			value: "",
			name: "All Exchanges",
			desc: ""
		},
		{
			value: "Mradhul Exchange",
			name: "Mradhul Exchange",
			desc: "Mradhul Exchange"
		}

		],
		symbols_types: [{
			name: "All types",
			value: ""
		},
		{
			name: "Cryptocurrency",
			value: "crypto"
		}
		],
		"supported_resolutions": ["1", "5", "15", "30", "60", "240", "480", "720", "1D", "1W", "1M"],
	};

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(config));
	response.end();
};


RequestProcessor.prototype._sendMarks = function (response) {
	var now = new Date();
	now = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 1000;
	var day = 60 * 60 * 24;

	var marks = {
		id: [0, 1, 2, 3, 4, 5],
		time: [now, now - day * 4, now - day * 7, now - day * 7, now - day * 15, now - day * 30],
		color: ["red", "blue", "green", "red", "blue", "green"],
		text: ["Today", "4 days back", "7 days back + Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "7 days back once again", "15 days back", "30 days back"],
		label: ["A", "B", "CORE", "D", "EURO", "F"],
		labelFontColor: ["white", "white", "red", "#FFFFFF", "white", "#000"],
		minSize: [14, 28, 7, 40, 7, 14]
	};

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(marks));
	response.end();
};

RequestProcessor.prototype._sendTime = function (response) {
	var now = new Date();
	response.writeHead(200, defaultResponseHeader);
	response.write(Math.floor(now / 1000) + '');
	response.end();
};

RequestProcessor.prototype._sendTimescaleMarks = function (response) {
	var now = new Date();
	now = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 1000;
	var day = 60 * 60 * 24;

	var marks = [{
		id: "tsm1",
		time: now,
		color: "red",
		label: "A",
		tooltip: ""
	},
	{
		id: "tsm2",
		time: now - day * 4,
		color: "blue",
		label: "D",
		tooltip: ["Dividends: $0.56", "Date: " + new Date((now - day * 4) * 1000).toDateString()]
	},
	{
		id: "tsm3",
		time: now - day * 7,
		color: "green",
		label: "D",
		tooltip: ["Dividends: $3.46", "Date: " + new Date((now - day * 7) * 1000).toDateString()]
	},
	{
		id: "tsm4",
		time: now - day * 15,
		color: "#999999",
		label: "E",
		tooltip: ["Earnings: $3.44", "Estimate: $3.60"]
	},
	{
		id: "tsm7",
		time: now - day * 30,
		color: "red",
		label: "E",
		tooltip: ["Earnings: $5.40", "Estimate: $5.00"]
	},
	];

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(marks));
	response.end();
};


RequestProcessor.prototype._sendSymbolSearchResults = function (query, type, exchange, maxRecords, response) {
	if (!maxRecords) {
		throw "wrong_query";
	}

	var result = this._symbolsDatabase.search(query, type, exchange, maxRecords);

	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(result));
	response.end();
};

RequestProcessor.prototype._prepareSymbolInfo = function (symbolName) {
	var symbolInfo = this._symbolsDatabase.symbolInfo(symbolName);

	if (!symbolInfo) {
		throw "unknown_symbol " + symbolName;
	}

	var data = {
		"name": symbolInfo.name,
		"has_volume": true,
		"has_weekly_and_monthly": true,
		"volume_precision": 8,
		"exchange-traded": "Mradhul Exchange",
		"exchange-listed": "Mradhul Exchange",
		"timezone": "Etc/UTC+5:30",
		"minmov": 1,
		"minmov2": 0,
		"pointvalue": 1,
		"session": "24x7",
		"exchange": "Mradhul Exchange",
		"has_intraday": true,
		"description": symbolInfo.description.length > 0 ? symbolInfo.description : symbolInfo.name,
		"type": "stock",
		"supported_resolutions": ["1", "5", "15", "30", "60", "240", "480", "720", "1D", "1W", "1M"],
		"pricescale": 100000000,
		"ticker": symbolInfo.name.toUpperCase()
	};

	if (symbolInfo.name.split('/')[1].match(/USD|EUR|JPY|AUD|GBP|KRW|CNY|INR/)) {
		data.pricescale = 100;

	}

	return data;

};

RequestProcessor.prototype._sendSymbolInfo = async function (symbolName, response) {
	var info = this._prepareSymbolInfo(symbolName);
	response.writeHead(200, defaultResponseHeader);
	response.write(JSON.stringify(info));
	response.end();
};

RequestProcessor.prototype._sendSymbolHistory = async function (symbol, startDateTimestamp, endDateTimestamp, resolution, response) {
	function sendResult(content) {
		var header = Object.assign({}, defaultResponseHeader);
		header["Content-Length"] = content.length;
		response.writeHead(200, header);
		response.write(content, null, function () {
			response.end();
		});
	}

	function secondsToISO(sec) {
		if (sec === null || sec === undefined) {
			return 'n/a';
		}
		return (new Date(sec * 1000).toISOString());
	}

	function logForData(data, key, isCached) {
		var fromCacheTime = data && data.t ? data.t[0] : null;
		var toCacheTime = data && data.t ? data.t[data.t.length - 1] : null;
	}


	var from = bytexcMinimumDate;
	var to = dateToYMD(Date.now());

	var key = symbol + "|" + from + "|" + to;

	var abcdKey = getValidabcdKey();
	if (abcdKey === null) {
		sendError('No valid API Keys available', response);
		return;
	}

	var pair_name = symbol.replace("_", "/");
	var order = require('../../model/order');
	if (resolution == "1d") {
		resolution = 24 * 60 * 60;
	} else if (resolution == "1w") {
		resolution = 7 * 24 * 60 * 60;
	} else if (resolution == "1m") {
		resolution = 30 * 24 * 60 * 60;
	} else if (resolution == '1' || resolution == '2' || resolution == '5' || resolution == '15' || resolution == '30' || resolution == '60' || resolution == '240') {

		resolution = parseFloat(resolution) * 60;
	} else {
		resolution = 5 * 60;
	}
	resolution = resolution * 1000;
	var pattern = /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/;
	if (from) {
		if (!pattern.test(from)) {
			res.send({ "message": "Start date is not a valid format" });
			return false;
		}
	}
	else {
		res.send({ "message": "Start date parameter not found" });
		return false;
	}
	if (to) {
		if (!pattern.test(to)) {
			res.send({ "message": "End date is not a valid format" });
			return false;
		}
	}
	else {
		res.json({ "message": "End date parameter not found" });
		return false;
	}

	var sDate = from + 'T00:00:00.000Z';
	var eDate = to + 'T23:59:59.000Z';
	if (sDate > eDate) {
		res.json({ "message": "Please ensure that the End Date is greater than or equal to the Start Date" });
		return false;
	}

	var time = [], open = [], close = [], high = [], low = [], volume = [];
	order.aggregate([
		{ $match: { pair: pair_name.toLowerCase(), date: { $gte: new Date(sDate), $lt: new Date(eDate) } } },
		{ $group: { _id: { $floor: { $divide: [{ "$subtract": ["$date", new Date("1970-01-01")] }, resolution] } }, count: { $sum: 1 }, Date: { $first: "$date" }, pair: { $first: '$pair' }, low: { $min: '$price' }, high: { $max: '$price' }, open: { $first: '$price' }, close: { $last: '$price' }, volume: { $sum: '$total' } } },
		{ $project: { _id: 0, Date: "$Date", pair: { $literal: pair_name.replace("/", "_").toUpperCase() }, low: "$low", high: "$high", open: "$open", close: "$close", volume: "$volume", exchange: { $literal: "Mradhul Exchange" } } },
		{ $sort: { Date: 1 } }
	]).exec(function (err, result) {
		if (err || result.length == 0)
			sendResult(JSON.stringify({ t: time, o: open, c: close, h: high, l: low, v: volume, s: "ok" }));
		else {
			result = result.map(e => {
				var arr = [];
				arr.push(e.Date.getTime(), e.open, e.high, e.low, e.close, e.volume);
				return arr;
			})

			for (var index = 0; index < result.length; index++) {
				time.push(result[index][0] / 1000);
				open.push(result[index][1]);
				high.push(result[index][2]);
				low.push(result[index][3]);
				close.push(result[index][4]);
				volume.push(result[index][5].toFixed(8));

				if (result.length == index + 1) {
					sendResult(JSON.stringify({ t: time, o: open, c: close, h: high, l: low, v: volume, s: "ok" }));
					break;
				}
			}
		}
	});


};

RequestProcessor.prototype._quotesabcdWorkaround = function (tickersMap) {
	var from = bytexcMinimumDate;
	var to = dateToYMD(Date.now());

	var result = {
		s: "ok",
		d: [],
		source: 'Mradhul Exchange',
	};

	Object.keys(tickersMap).forEach(function (symbol) {
		var key = symbol + "|" + from + "|" + to;
		var ticker = tickersMap[symbol];

		var data = abcdCache[key];
		var length = data === undefined ? 0 : data.c.length;

		if (length > 0) {
			var lastBar = {
				o: data.o[length - 1],
				h: data.o[length - 1],
				l: data.o[length - 1],
				c: data.o[length - 1],
				v: data.o[length - 1],
			};

			result.d.push({
				s: "ok",
				n: ticker,
				v: {
					ch: 0,
					chp: 0,
					short_name: symbol,
					exchange: '',
					original_name: ticker,
					description: ticker,
					lp: lastBar.c,
					ask: lastBar.c,
					bid: lastBar.c,
					open_price: lastBar.o,
					high_price: lastBar.h,
					low_price: lastBar.l,
					prev_close_price: length > 1 ? data.c[length - 2] : lastBar.o,
					volume: lastBar.v,
				}
			});
		}
	});

	return result;
};

RequestProcessor.prototype._sendQuotes = function (tickersString, response) {
	var tickersMap = {};

	var tickers = tickersString.split(",");
	[].concat(tickers).forEach(function (ticker) {
		var yqlSymbol = ticker.replace(/.*:(.*)/, "$1");
		tickersMap[yqlSymbol] = ticker;
	});

	if (this._failedYahooTime[tickersString] && Date.now() - this._failedYahooTime[tickersString] < yahooFailedStateCacheTime) {
		sendJsonResponse(response, this._quotesabcdWorkaround(tickersMap));
		return;
	}

	var that = this;

	var yql = "env 'store://datatables.org/alltableswithkeys'; select * from yahoo.finance.quotes where symbol in ('" + Object.keys(tickersMap).join("','") + "')";

	var options = {
		host: "query.yahooapis.com",
		path: "/v1/public/yql?q=" + encodeURIComponent(yql) +
			"&format=json" +
			"&env=store://datatables.org/alltableswithkeys"
	};

	http.request(options, function (res) {
		var result = '';

		res.on('data', function (chunk) {
			result += chunk;
		});

		res.on('end', function () {
			var jsonResponse = {
				s: 'error'
			};

			if (res.statusCode === 200) {
				jsonResponse = convertYahooQuotesToUDFFormat(tickersMap, JSON.parse(result));
			} else {
			}

			if (jsonResponse.s === 'error') {
				that._failedYahooTime[tickersString] = Date.now();
				jsonResponse = that._quotesabcdWorkaround(tickersMap);
			}

			sendJsonResponse(response, jsonResponse);
		});
	}).end();
};

RequestProcessor.prototype._sendNews = function (symbol, response) {
	var options = {
		host: "feeds.finance.yahoo.com",
		path: "/rss/2.0/headline?s=" + symbol + "&region=US&lang=en-US"
	};

	proxyRequest(http, options, response);
};

RequestProcessor.prototype._sendFuturesmag = function (response) {
	var options = {
		host: "www.futuresmag.com",
		path: "/rss/all"
	};

	proxyRequest(http, options, response);
};

RequestProcessor.prototype.processRequest = function (action, query, response) {
	try {
		if (action === "/config") {
			this._sendConfig(response);
		} else if (action === "/symbols" && !!query["symbol"]) {
			this._sendSymbolInfo(query["symbol"], response);
		} else if (action === "/search") {
			this._sendSymbolSearchResults(query["query"], query["type"], query["exchange"], query["limit"], response);
		} else if (action === "/history") {
			query["symbol"] = query["symbol"].replace("/", "_");
			this._sendSymbolHistory(query["symbol"], query["from"], query["to"], query["resolution"].toLowerCase(), response);
		} else if (action === "/quotes") {
			this._sendQuotes(query["symbols"], response);
		} else if (action === "/marks") {
			this._sendMarks(response);
		} else if (action === "/time") {
			this._sendTime(response);
		} else if (action === "/timescale_marks") {
			this._sendTimescaleMarks(response);
		} else if (action === "/news") {
			this._sendNews(query["symbol"], response);
		} else if (action === "/futuresmag") {
			this._sendFuturesmag(response);
		} else {
			response.writeHead(200, defaultResponseHeader);
			response.write('Datafeed version is ' + version +
				'\nValid keys count is ' + String(abcdKeys.length - invalidabcdKeys.length) +
				'\nCurrent key is ' + (getValidabcdKey() || '').slice(0, 3) +
				(invalidabcdKeys.length !== 0 ? '\nInvalid keys are ' + invalidabcdKeys.reduce(function (prev, cur) {
					return prev + cur.slice(0, 3) + ',';
				}, '') : ''));
			response.end();
		}
	} catch (error) {
		sendError(error, response);
	}
};

exports.RequestProcessor = RequestProcessor;