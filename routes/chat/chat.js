"use strict"
const
	lib = require('../../lib/lib');

let rooms = require('./socket').rooms;

function init (app) {
	app.get('/chat', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			sendData.user_name = req.session.userData.user_name;
			sendData.rooms = rooms;
			console.log('내정보 : ', req.session.userData);
			res.render('chat/chat', sendData);
		});
	});

	app.get('/chat/:room_id', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			let room_id = req.params.room_id;

			if (room_id == 'new') {
				room_id = lib.getRoomId();
				return res.redirect('/chat/' + room_id);
			}

			sendData.room_id = room_id;
			sendData.user_name = req.session.userData.user_name;

			res.render('chat/chatRoom', sendData);
		});
	});
}
exports.init = init;