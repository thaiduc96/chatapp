let express = require('express')
let app = express();

var moment = require('moment');

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.PORT || 3000;

var pushService = (function() {
	var connections = {};
	var arrMessages = [];
	return {
		// đăng kí user lên socket khi user login 
		registerUser: function(userName, socket) {
			if (connections[userName] === undefined) {
				connections[userName] = {};
			}
			socket.userName = userName;
			connections[userName] = socket; // lưu lại socket. cho kết nối hiện tại
			io.sockets.emit('user_online', userName);
			socket.emit('register_success', userName);
			console.log('Registered socket for user ' + userName);
			return true;
		},
		// xóa socket khi logout
		removeConnection: function(socket) {
			var userName = socket.userName;
			// kiểm tra tồn tại userName và kết nối socket
			if (userName && connections[userName] && connections[userName]) {
				console.log('Removed socket for user ' + userName);
				delete connections[userName];
			}
		},
		//đẩy tin nhắn lên group chat.
		pushMessage: function(userName, message) {
			var userConnections = connections[userName];
			if (userConnections) {
				var socket = connections[userName];
				if (socket != null) {
					// socket.emit('message', message);
					arrMessages.push(message);
					io.sockets.emit('sever_new_message', message);
				}
			}
		},

		// get tat ca connection hiện tại
		getConnection: function() {
			return Object.keys(connections);
		},

		getMessages: function() {
			return arrMessages;
		},

		// pushMessagesAndUserOnload: function(userName){
		// var userConnections = connections[userName];
		// 	if (userConnections) {
		// 		var socket = connections[userName];
		// 		if (socket != null) {
		// 			socket.emit('list_user_online', Object.keys(connections));
		// 			socket.emit('list_old_messages', arrMessages);
		// 		}
		// 	}
		// }
			
	}
}());


/**
 * Handle connection to socket.io.
 */
io.on('connection', function(socket) {
	/**
	 * On registered socket from client.
	 */
	socket.on('register', function(userId) {
		pushService.registerUser(userId, socket);
	});

	/**
	 * On disconnected socket.
	 */
	socket.on('disconnect', function() {
		pushService.removeConnection(socket);
	});

	socket.on('on_load', function (userName) {	
		console.log(pushService.getConnection());
		console.log(pushService.getMessages());
		socket.emit('list_user_online', pushService.getConnection() );
		socket.emit('list_old_messages', pushService.getMessages() );
	});
});

// var arrUser = [];
// var arrMessages = [];
// io.on('connection', (socket) => {
// 	// socket.on('register', function (userName, connectionid) {
// 	// 	pushService.registerUser(userName, connectionid, socket)
// 	// 	socket.emit('register_success', userInfo);
// 	// 	io.sockets.emit('user_online', userInfo);
// 	// 	// }
// 	// });

// 	socket.on('on_load', function () {
// 		pushService.pushMessagesAndUserOnload();
// 	});

// 	// socket.on('disconnect', function () {
// 	// 	var index = arrUser.map(x => {
// 	// 		return x.id;
// 	// 	}).indexOf(socket.id);
// 	// 	arrUser.splice(index, 1);
// 	// });

// 	// socket.on('clien_new_message', (data) => {
// 	// 	var user = arrUser.find(d => d.id == socket.id || d.userName == socket.userName);
// 	// 	if (user && data.trim()) {
// 	// 		var mes = {
// 	// 			userName: user.userName,
// 	// 			id: user.id,
// 	// 			message: data,
// 	// 			currentTime: moment().format('hh:mm:ss a dd/MM/YY')
// 	// 		}
// 	// 		arrMessages.push(mes);
// 	// 		io.sockets.emit('sever_new_message', mes);
// 	// 	}
// 	// });
// });

server.listen(port, () => {
	console.log(`started on port: ${port}`);
});