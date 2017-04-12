"use strict"
const
	lib = require('../../lib/lib'),
	global = require('../../lib/global');
const
	STANDBY = 100, //TODO 모듈화
	READY = 200,
	PLAY = 300,
	FINISH = 400;

let rooms = global.getRoomList();

function init(app) {
	app.get('/chat', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			sendData.user_id = req.session.userData.user_id;

			console.log('내정보 : ', req.session.userData);

			res.render('chat/lobby', sendData);
		});
	});

	app.get('/chat/:room_id', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			let user_id = req.session.userData.user_id;
			let user_uuid = req.session.userData.user_uuid;
			let room_id = req.params.room_id;
			let isResume = req.query.isResume;
			let new_room_id;

			if (room_id == 'match') {
				for (let key in rooms) {
					if (rooms[key].userlist.length < 2 && rooms[key].play_status <= STANDBY) {
						new_room_id = key;
						break;
					}
				}
			}

			if (room_id == 'new' || room_id == 'match') {
				if (new_room_id)
					room_id = new_room_id;
				else
					room_id = lib.getRoomId();

				return res.redirect('/chat/' + room_id);
			}

			let room = rooms[room_id];

			if (room && room.userlist.length >= 2 && (room.userlist.indexOf(user_id) < 0)) 	//튕긴방일때는 튕긴 사람만 들어갈 수 있다 (클라서도 막음)
				return res.redirect('/chat?fail_reason=Game is ongoing');						//TODO 관리자일 때는 입장 가능하게 해줘야함.

			if (isResume && !room) //'이전 방 들어가기' 누름. 하지만 방이 이미 사라져서 못들어감. (클라서도 막음)
				return res.redirect('/chat?fail_reason=The room does not exist any more');

			sendData.room_id = room_id;
			sendData.user_id = user_id;
			sendData.user_uuid = user_uuid;

			res.cookie('last_room_id', room_id, { maxAge: 10 * 60 * 1000, httpOnly: true }); //last_room_id 10분간 쿠키에 저장

			res.render('chat/chatRoom', sendData);
		});
	});

	app.post('/chat/initList', function (req, res) {
		let sendData = {};
		sendData.rooms = rooms;
		sendData.last_room_id = req.cookies.last_room_id;

		res.send(sendData);
	});

	app.post('/chat/:room_id/controlPiece', function (req, res) {
		let value = req.body.value;
		console.log('value: ', value);

		res.send({ 'resultData': 'ok' });
	});

	app.post('/chat/:room_id/saveResult', function (req, res) {
		let room_id = req.params.room_id;
		let user_id = req.body.user_id;
		let room = rooms[room_id];

		let winner = room.userlist[0] == user_id ? 0 : 1;
		let loser = room.userlist[0] == user_id ? 1 : 0;

		room.play_status = FINISH;
		room.winner = winner;
		room.loser = loser;

		let multi = req.cache.multi();
		multi.hincrby('UUID::' + room.uuid_list[winner], 'win_count', 1);
		multi.hincrby('UUID::' + room.uuid_list[loser], 'lose_count', 1);
		multi.rpush('RESULT', JSON.stringify(room));
		multi.exec(function (err, results) {
			if (err) throw err;

			res.send({ 'resultData': 'ok' });
		});
	});
}
exports.init = init; 