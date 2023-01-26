var express = require('express'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  http = require('http'),
  path = require('path'),
  fs = require('fs'),
  https = require('https'),
  logger = require('morgan'),
  socketio = require('socket.io');

var config = require('./QRklHLVNFRFWE/config');
var app = express();

require('./QRklHLVNFRFWE/ZXNhYmF0YWQ');
app.use(cors());
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: __dirname })
})

app.use(express.static(path.join(__dirname, "./public")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Authorization");
  return next()
})

app.use(
  require('./UVUVUSLUVMSUY/user/get'),
  // require('./UVUVUSLUVMSUY/user/post'),
  // require('./UVUVUSLUVMSUY/fiat/get'),
  // require('./UVUVUSLUVMSUY/fiat/post'),
  // require('./UVUVUSLUVMSUY/crypto/get'),
  // require('./UVUVUSLUVMSUY/crypto/post'),
  // require('./UVUVUSLUVMSUY/trade/get'),
  // require('./UVUVUSLUVMSUY/trade/post'),
  // require('./UVUVUSLUVMSUY/admin/admin'),
  // require('./UVUVUSLUVMSUY/admin/block'),
  // require('./UVUVUSLUVMSUY/admin/blog'),
  // require('./UVUVUSLUVMSUY/admin/chart'),
  // require('./UVUVUSLUVMSUY/admin/coin'),
  // require('./UVUVUSLUVMSUY/admin/config'),
  // require('./UVUVUSLUVMSUY/admin/faq'),
  // require('./UVUVUSLUVMSUY/admin/bullet_faq'),
  // require('./UVUVUSLUVMSUY/admin/fees'),
  // require('./UVUVUSLUVMSUY/admin/home'),
  // require('./UVUVUSLUVMSUY/admin/pair'),
  // require('./UVUVUSLUVMSUY/admin/profit'),
  // require('./UVUVUSLUVMSUY/cron-security'),
  // require('./UVUVUSLUVMSUY/admin/subadmin'),
  // require('./UVUVUSLUVMSUY/admin/template'),
  // require('./UVUVUSLUVMSUY/admin/wallet'),
  // require('./UVUVUSLUVMSUY/admin/wallet')
);

app.use('*', (req, res) => {
  res.sendFile('views/404.html', { root: __dirname })
})

var winston = require('./UVUVUSLUVMSUY/logger');
var server;

if (process.env.NODE_ENV == 'devel' || process.env.NODE_ENV == 'local')
  server = http.createServer(app);
else {
  var options = {
    key: fs.readFileSync('osiztechnologies.key'),
    cert: fs.readFileSync('osiztechnologies.crt')
  };
  server = https.createServer(options, app);
}

server.listen(config.port, () => console.log(`Server initiated and running on port ${ config.port }`));

var io = socketio.listen(server);

socket_file = require('./helper/config');
socket_file.initiate(io);

io.on('connection', (socket) => {
  // require('./helper/socket_file')(io, socket)
  socket.on('connect', (param) => {
    socket.join(param)
  })

  socket.on('sendMessage', (param) => {
    socket.join(param.message)
  })
})