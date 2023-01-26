var socket = 0;

module.exports.initiate = (socketio)=>{
	socket = socketio;
}

module.exports.sendmessage = (method, message)=>{
	socket.sockets.emit(method, message)
}

module.exports.send_trade_response = (method, message)=>{
	socket.sockets.to(message.pair.replace("/", "_")).emit(method, message)
}