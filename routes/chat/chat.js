"use strict"
const
	lib = require('../../lib/lib');

let rooms = require('./socket').rooms;

function init (app) {
	app.get('/chat', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			sendData.user_name = req.session.userData.user_name;
			sendData.last_room_id = req.cookies.last_room_id;

			console.log('내정보 : ', req.session.userData);
			console.log('내 쿠키: ', req.cookies);

			console.log('req.cookies.last_room_id: ', req.cookies.last_room_id);
			res.render('chat/lobby', sendData);
		});
	});

	app.post('/chat', function (req, res) {
		res.send({'rooms': rooms});
	});

	app.get('/chat/:room_id', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			let user_name = req.session.userData.user_name;
			let room_id = req.params.room_id;
			let new_room_id;

			if (room_id == 'match') {
				for (let key in rooms) {
					if (rooms[key].userlist.length < 2) {
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

			// if (room && room.userlist.indexOf(user_name) > -1)	//TODO 중복 입장 방지인데 새로고침을 허용해야됨?
			// 	return res.redirect('/chat');

			if (room && room.userlist.length >= 2) 	//인원 꽉 참
				return res.redirect('/chat'); 		//TODO 관리자일 때는 입장 가능하게 해줘야함.

			sendData.room_id = room_id;
			sendData.rooms = rooms;
			sendData.user_name = user_name;

			res.cookie('last_room_id', room_id, { maxAge: 1 * 60 * 1000, httpOnly: true}); //채팅방 정보는 1분만 쿠키에 보관. TODO 나갈때 보관해야되는데....

			res.render('chat/chatRoom', sendData);
		});
	});
}
exports.init = init;