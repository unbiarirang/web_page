"use strict"

let rooms = {};
let userlist = {};

function init(http) {
	let io = require('socket.io')(http);

	io.on('connection', function (socket) {
		socket.on('lobby', function (data) {
			let user_name = data.user_name;
			
			socket.user_name = user_name;
			userlist[user_name] = 'lobby';

			console.log('userlist: ', userlist);
			socket.join('lobby');
			socket.broadcast.to('lobby').emit('lobbyChat', 'SERVER: ' + user_name + ' 님이 로비에 입장하셨습니당.');
		});

		socket.on('lobbyChat', function (msg) {
			console.log('message from ' + socket.user_name + ': ' + msg);
			io.sockets.in('lobby').emit('lobbyChat', socket.user_name + ': ' + msg);
		});

		socket.on('adduser', function (data) {
			let user_name = data.user_name;
			let room_id = data.room_id;

			socket.user_name = user_name;
			socket.room_id = room_id;

			if (!rooms.hasOwnProperty(room_id)) {       //새로운방 생성
				let room = {};
				room.userlist = [];
				room.userlist.push(user_name);
				rooms[room_id] = room;
				userlist[user_name] = room_id;
			}
			else {                                      //기존 채팅방에 입장
				let room = rooms[room_id];

				if (room.userlist.indexOf(user_name) > -1) //중복 입장 안돼
					return;

				room.userlist.push(user_name);
				userlist[user_name] = room_id;
			}

			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.join(room_id);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_name + ' 님이 ' + room_id + ' 방에 입장하셨습니당.');
		});

		socket.on('chat', function (msg) {
			console.log('roomId ', socket.room_id, ' message from ' + socket.user_name + ': ' + msg);
			io.sockets.in(socket.room_id).emit('chat', socket.user_name + ': ' + msg);
		});

		socket.on('disconnect', function () {
			let user_name = socket.user_name;
			let room_id = socket.room_id;

			if (userlist[user_name] == 'lobby') { //로비에서 나감
				return delete userlist[user_name]; 
			}

			if (!rooms[room_id] || rooms[room_id].userlist.indexOf(user_name) < 0) //이미 삭제된 룸이거나 이미 삭제된 유저
				return;

			delete userlist[user_name];                     //글로벌 유저 리스트에서 자신 삭제

			if (rooms[room_id].userlist.length == 1)      	//혼자 있으니 채팅방 삭제
				delete rooms[room_id];
			else {                                          //채팅방 유저 리스트에서 자신 삭제
				let index = rooms[room_id].userlist.indexOf(user_name);
				rooms[room_id].userlist.splice(index, 1);
			}

			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_name + ' 님이 퇴장하셨습니당.');
		});
	});
}
exports.init = init;
exports.rooms = rooms;