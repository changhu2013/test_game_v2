
var config = require('./config');
var app = require('./app.js');
var http = require('http').Server(app);

//var io = require('socket.io')(http);
//require('./models/BattleIo.js').setSocketIo(io);

http.listen(config.port);

console.log('服务已启动,监听端口为' + config.port);