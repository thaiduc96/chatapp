let express = require('express')
let app = express();

var moment = require('moment');

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.PORT || 3000;

var arrUser = [];
var arrMessages = [];
io.on('connection', (socket) => {
    socket.on('register', function(user) {
		console.log(user);
		if ( arrUser.find(d => d.id == socket.id || d.userName == socket.userName )) {
			socket.emit('register_fail',user);
		}
			// nếu có user thì sửa lại socketId
			// console.log(user.id);
			// if(user.id){
			// 	arrUser.find(u => u.userName == user.userName).id = socket.id;
			// 	var index = arrUser.map(x => {
			// 		return x.userName;
			// 	}).indexOf(user.userName);
			// 	arrUser.splice(index, 1);
			// }
			// đăng kí lại
			var userInfo = {
				userName : (user.userName) ? user.userName : user,
				id : socket.id
			}
			arrUser.push(userInfo);	
			socket.userName = (user.userName) ? user.userName : user;
			socket.emit('register_success',userInfo);

			io.sockets.emit('user_online', userInfo);
		// }
    });
    
    socket.on('on_load', function() {
		socket.emit('list_user_online', arrUser);
		socket.emit('list_old_messages', arrMessages);
    });

    socket.on('disconnect', function() {
		var index = arrUser.map(x => {
			return x.id;
			}).indexOf(socket.id);
			arrUser.splice(index, 1);
    });
    
    socket.on('clien_new_message', (data) => {
		var user = arrUser.find(d => d.id == socket.id || d.userName == socket.userName );
		if( user && data.trim() ){
			var mes = {
				userName : user.userName,
				id : user.id,
				message : data,
				currentTime: moment().format('hh:mm:ss a dd/MM/YY')
			}
			arrMessages.push(mes);
			io.sockets.emit('sever_new_message', mes );
		}
    });
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

