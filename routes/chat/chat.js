"use strict"
const
	lib = require('../../lib/lib');
const
	STANDBY = 100, //TODO 모듈화
	READY = 200,
	PLAY = 300,
	FINISH = 400;

let rooms = require('./socket').rooms;

function init (app) {
	app.get('/chat', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			sendData.user_name = req.session.userData.user_name;

			console.log('내정보 : ', req.session.userData);
			console.log('내 쿠키: ', req.cookies);

			res.render('chat/lobby', sendData);
		});
	});

	app.post('/chat', function (req, res) {
		let sendData = {};
		sendData.rooms = rooms;
		sendData.last_room_id = req.cookies.last_room_id;

		res.send(sendData);
	});

	app.get('/chat/:room_id', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			let user_name = req.session.userData.user_name;
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

			// if (room && room.userlist.length >= 2) //방 인원 꽉 참 (클라서도 막음)
			// 	return res.redirect('/chat?fail_reason=The room is full'); //TODO 관리자일 때는 입장 가능하게 해줘야함.

			if (room && room.play_status >= PLAY && req.cookies.last_room_id != room_id) //게임이 진행중인 방. 튕긴사람은 들어갈 수 있게 (클라서도 막음)
				return res.redirect('/chat?fail_reason=Game is ongoing'); //TODO 관리자일 때는 입장 가능하게 해줘야함.

			if (isResume && !rooms[room_id]) //'이전 방 들어가기' 누름. 하지만 방이 이미 사라져서 못들어감. (클라서도 막음)
				return res.redirect('/chat?fail_reason=The room does not exist any more');

			sendData.room_id = room_id;
			sendData.rooms = rooms;
			sendData.user_name = user_name;

			res.cookie('last_room_id', room_id, { maxAge: 10 * 60 * 1000, httpOnly: true}); //last_room_id 10분간 쿠키에 저장

			res.render('chat/chatRoom', sendData);
		});
	});

	app.post('/chat/:room_id/control', function (req, res) {
		let value = req.body.value;
		console.log('value: ', value);

		res.send({'resultData': 'ok'});
	});
}
exports.init = init;