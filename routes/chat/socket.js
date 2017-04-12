"use strict"

const
	global = require('../../lib/global');
const
	STANDBY = 100,
	READY = 200,
	PLAY = 300,
	FINISH = 400;

let rooms = global.getRoomList();
let userlist = global.getUserList();

function init(http) {
	let io = require('socket.io')(http);

	io.on('connection', function (socket) {
		socket.on('lobby', function (data) {
			let user_id = data.user_id;
			
			socket.user_id = user_id;
			userlist[user_id] = 'lobby';

			console.log('userlist: ', userlist);
			socket.join('lobby');
			socket.broadcast.to('lobby').emit('lobbyChat', 'SERVER: ' + user_id + ' 님이 로비에 입장하셨습니당.');
		});

		socket.on('lobbyChat', function (msg) {
			console.log('message from ' + socket.user_id + ': ' + msg);
			io.sockets.in('lobby').emit('lobbyChat', socket.user_id + ': ' + msg);
		});

		socket.on('addUser', function (data) {
			let user_id = data.user_id;
			let user_uuid = data.user_uuid;
			let room_id = data.room_id;

			socket.user_id = user_id;
			socket.room_id = room_id;

			if (!rooms.hasOwnProperty(room_id)) {       //새로운방 생성
				let room = {
					'play_status': STANDBY,
					'userlist': [],
					'uuid_list': [],
					'ready': '',
					'turn': '',
					'winner': '',
					'loser': '',
					'start_time': null,
					'end_time': null,
					'is_draw': false
				}
				room.userlist.push(user_id);
				room.uuid_list.push(user_uuid);
				rooms[room_id] = room;
				userlist[user_id] = room_id;
			}
			else {                                      //기존 채팅방에 입장
				let room = rooms[room_id];

				if (room.userlist.indexOf(user_id) < 0) {
					room.userlist.push(user_id);
					room.uuid_list.push(user_uuid);
				}
				userlist[user_id] = room_id;

				socket.broadcast.to(room_id).emit('resume');
			}

			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.join(room_id);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_id + ' 님이 ' + room_id + ' 방에 입장하셨습니당.');
		});

		socket.on('chat', function (msg) {
			let room_id = socket.room_id;
			let user_id = socket.user_id;
			let room = rooms[room_id];

			console.log('roomId ', room_id, ' message from ' + user_id + ': ' + msg);
			io.sockets.in(room_id).emit('chat', user_id + ': ' + msg);
		});

		socket.on('ready', function (data) {
			let room_id = socket.room_id;
			let user_id = socket.user_id;
			let room = rooms[room_id];
			let play_status = room.play_status;

			let enemy = room.userlist[0] == user_id ? room.userlist[1] : room.userlist[0];

			console.log('rooms: ', rooms);

			if (room.userlist.length == 1) return; 		//혼자 있을 때 레디
			if (play_status >= PLAY) return;			//이미 플레이 중
			if (room.ready == data.user_id) return; 	//한사람이 레디 여러번함

			if (play_status == READY) {
				room.play_status = PLAY;
				room.turn = room.ready;
				room.start_time = Date.now();			//밀리초
				io.sockets.in(room_id).emit('chat', 'SERVER: GAME START');

				if (room.userlist[0] == user_id) {		//내가 방장 (방장 먼저 게임 시작)
					socket.emit('myTurn');
					room.turn = user_id;
				}
				else {
					socket.broadcast.to(room_id).emit('myTurn');
					room.turn = enemy;
				}
				return;	
			}

			console.log(socket.user_id + ' is ready');
			room.play_status = READY;
			room.ready = data.user_id;
			io.sockets.in(room_id).emit('chat', 'SERVER: ' + user_id + ' IS READY~');
		});

		socket.on('resume', function () { //누구의 턴인지 확인한 뒤 게임 재개
			let room_id = socket.room_id;
			let user_id = socket.user_id;
			let room = rooms[room_id];

			if (room.turn == user_id)
				socket.emit('myTurn');
			else
				socket.broadcast.to(room_id).emit('myTurn');
		});

		socket.on('yourTurn', function () {
			let room_id = socket.room_id;
			let user_id = socket.user_id;
			let room = rooms[room_id];
			let enemy = room.userlist[0] == user_id ? room.userlist[1] : room.userlist[0];

			room.turn = enemy;
			socket.broadcast.to(room_id).emit('myTurn');
		});

		socket.on('finish', function () {
			let room_id = socket.room_id;
			let user_id = socket.user_id;

			io.sockets.in(room_id).emit('chat', 'SERVER: ' + user_id + '님이 승리하였습니다.');
			// io.sockets.in(room_id).emit('finish');
		});

		socket.on('disconnect', function () {
			let user_id = socket.user_id;
			let room_id = socket.room_id;
			let room = rooms[room_id];

			if (userlist[user_id] == 'lobby') //로비에서 나감
				return delete userlist[user_id]; 

			if (!room || room.userlist.indexOf(user_id) < 0) //이미 삭제된 룸이거나 이미 삭제된 유저
				return;

			delete userlist[user_id];               //글로벌 유저 리스트에서 자신 삭제

			console.log(room.userlist.length);

			if (room.userlist.length == 1)			//혼자 였으니 채팅방 삭제
				return delete rooms[room_id];

			if ((userlist[room.userlist[0]] != room_id) && (userlist[room.userlist[1]] != room_id)) //둘다 나갔으니 채팅방 삭제
				return delete rooms[room_id];

			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_id + ' 님이 퇴장하셨습니당.');
 
			if (room && room.play_status == FINISH)
				return;

			socket.broadcast.to(room_id).emit('terminate');
		});
	});
}
exports.init = init;
exports.rooms = rooms;