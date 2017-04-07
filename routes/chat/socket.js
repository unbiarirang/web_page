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
					'ready': '',
					'turn': ''
				}
				room.userlist.push(user_name);
				rooms[room_id] = room;
				userlist[user_name] = room_id;
			}
			else {                                      //기존 채팅방에 입장
				let room = rooms[room_id];

				if (room.userlist.indexOf(user_name) < 0)
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
			let room = rooms[room_id];

			console.log('roomId ', room_id, ' message from ' + user_name + ': ' + msg);
			io.sockets.in(room_id).emit('chat', user_name + ': ' + msg);
		});

		socket.on('ready', function (data) {
			let room_id = socket.room_id;
			let user_name = socket.user_name;
			let room = rooms[room_id];
			let play_status = room.play_status;

			let enemy = room.userlist[0] == user_name ? room.userlist[1] : room.userlist[0];

			console.log('rooms: ', rooms);

			if (room.userlist.length == 1) return; 		//혼자 있을 때 레디
			if (play_status >= PLAY) return;						//이미 플레이 중
			if (room.ready == data.user_name) return; 	//한사람이 레디 여러번함

			if (play_status == READY) {
				room.play_status = PLAY;
				room.turn = room.ready;
				io.sockets.in(room_id).emit('chat', 'SERVER: GAME START');

				if (room.userlist[0] == user_name) {		//내가 방장 (방장 먼저 게임 시작)
					socket.emit('myTurn');
					room.turn = user_name;
				}
				else {
					socket.broadcast.to(room_id).emit('myTurn');
					room.turn = enemy;
				}
				return;	
			}

			console.log(socket.user_name + ' is ready');
			room.play_status = READY;
			room.ready = data.user_name;
			io.sockets.in(room_id).emit('chat', 'SERVER: ' + user_name + ' IS READY~');
		});

		socket.on('resume', function () { //누구의 턴인지 확인한 뒤 게임 재개
			let room_id = socket.room_id;
			let user_name = socket.user_name;
			let room = rooms[room_id];

			if (room.turn == user_name)
				socket.emit('myTurn');
			else
				socket.broadcast.to(room_id).emit('myTurn');
		});

		socket.on('yourTurn', function () {
			let room_id = socket.room_id;
			let user_name = socket.user_name;
			let room = rooms[room_id];
			let enemy = room.userlist[0] == user_name ? room.userlist[1] : room.userlist[0];

			room.turn = enemy;
			socket.broadcast.to(room_id).emit('myTurn');
		});

		socket.on('finish', function() {
			let room_id = socket.room_id;
			let user_name = socket.user_name;
			let room = rooms[room_id];

			room.play_status = FINISH;

			io.sockets.in(room_id).emit('chat', 'SERVER: ' + user_name + '님이 승리하였습니다.');
			io.sockets.in(room_id).emit('finish');
		});

		socket.on('disconnect', function () {
			let user_name = socket.user_name;
			let room_id = socket.room_id;
			let room = rooms[room_id];

			if (userlist[user_name] == 'lobby') //로비에서 나감
				return delete userlist[user_name]; 

			if (!room || room.userlist.indexOf(user_name) < 0) //이미 삭제된 룸이거나 이미 삭제된 유저
				return;

			delete userlist[user_name];                     //글로벌 유저 리스트에서 자신 삭제

			console.log(room.userlist.length);

			if (room.userlist.length == 1)      	//혼자 였으니 채팅방 삭제
				return delete rooms[room_id];

			if ((userlist[room.userlist[0]] != room_id) && (userlist[room.userlist[1]] != room_id)) //둘다 나갔으니 채팅방 삭제
				return delete rooms[room_id];
			// else {                                          //채팅방 유저 리스트에서 자신 삭제
			// 	let index = rooms[room_id].userlist.indexOf(user_name);
			// 	rooms[room_id].userlist.splice(index, 1);
				
			// 	if (rooms[room_id].play_status < PLAY) {	//게임 도중에 나온게 아니라면 방 부분 초기화
			// 		rooms[room_id].play_status = STANDBY;
			// 		rooms[room_id].ready = '';
			// 		rooms[room_id].turn = '';
			// 	}
			// }
			console.log('rooms:', rooms, '\n userlist: ', userlist);
			socket.broadcast.to(room_id).emit('chat', 'SERVER: ' + user_name + ' 님이 퇴장하셨습니당.');
 
			if (room && room.play_status == FINISH)
				return;

			socket.broadcast.to(room_id).emit('terminate');
		});
	});
}
exports.init = init;
exports.rooms = rooms;