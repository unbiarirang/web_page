"use strict"

const
	STANDBY = 100,
	READY = 200,
	PLAY = 300,
	FINISH = 400;

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

		socket.on('addUser', function (data) {
			let user_name = data.user_name;
			let room_id = data.room_id;

			socket.user_name = user_name;
			socket.room_id = room_id;

			if (!rooms.hasOwnProperty(room_id)) {       //새로운방 생성
				let room = {
					'play_status' : STANDBY,
					'userlist' : [],
					'who_ready' : ''
				}
				room.userlist.push(user_name);
				rooms[room_id] = room;
				userlist[user_name] = room_id;
			}
			else {                                      //기존 채팅방에 입장
				let room = rooms[room_id];
				room.userlist.push(user_name);
				userlist[user_name] = room_id;
				socket.broadcast.to(room_id).emit('resume');
			}

			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.join(room_id);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_name + ' 님이 ' + room_id + ' 방에 입장하셨습니당.');
		});

		socket.on('chat', function (msg) {
			let room_id = socket.room_id;
			let user_name = socket.user_name;

			console.log('roomId ', room_id, ' message from ' + user_name + ': ' + msg);
			io.sockets.in(room_id).emit('chat', user_name + ': ' + msg);
		});

		socket.on('ready', function (data) {
			let room_id = socket.room_id;
			let user_name = socket.user_name;
			let play_status = rooms[room_id].play_status;

			console.log('rooms: ', rooms);

			if (rooms[room_id].userlist.length == 1) return; 		//혼자 있을 때 레디
			if (play_status >= PLAY) return;						//이미 플레이 중
			if (rooms[room_id].who_ready == data.user_name) return; //한사람이 레디 여러번함.

			if (play_status == READY) {
				rooms[room_id].play_status = PLAY;
				io.sockets.in(room_id).emit('chat', 'SERVER: GAME START');
				socket.broadcast.to(room_id).emit('myTurn');
				return;
			}

			console.log(socket.user_name + ' is ready');
			rooms[room_id].play_status = READY;
			rooms[room_id].who_ready = data.user_name;
			io.sockets.in(room_id).emit('chat', 'SERVER: ' + user_name + ' IS READY~');
		});

		socket.on('yourTurn', function () {
			let room_id = socket.room_id;

			console.log('in yourTurn ');
			socket.broadcast.to(room_id).emit('myTurn');
		});

		socket.on('disconnect', function () {
			let user_name = socket.user_name;
			let room_id = socket.room_id;

			if (userlist[user_name] == 'lobby') //로비에서 나감
				return delete userlist[user_name]; 

			if (!rooms[room_id] || rooms[room_id].userlist.indexOf(user_name) < 0) //이미 삭제된 룸이거나 이미 삭제된 유저
				return;

			delete userlist[user_name];                     //글로벌 유저 리스트에서 자신 삭제

			if (rooms[room_id].userlist.length == 1)      	//혼자 였으니 채팅방 삭제
				delete rooms[room_id];
			else {                                          //채팅방 유저 리스트에서 자신 삭제
				let index = rooms[room_id].userlist.indexOf(user_name);
				rooms[room_id].userlist.splice(index, 1);
				
				if (rooms[room_id].play_status < PLAY) {	//게임 도중에 나온게 아니라면 방 부분 초기화
					rooms[room_id].play_status = STANDBY;
					rooms[room_id].who_ready = '';
				}
			}

			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_name + ' 님이 퇴장하셨습니당.');

			if (rooms[room_id] && rooms[room_id].play_status == PLAY)
				socket.broadcast.to(room_id).emit('terminate', PLAY);
			if (rooms[room_id] && rooms[room_id].play_status == FINISH)
				socket.broadcast.to(room_id).emit('terminate', FINISH);
		});
	});
}
exports.init = init;
exports.rooms = rooms;