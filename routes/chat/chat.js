"use strict"
const
	lib = require('../../lib/lib');

let rooms = require('./socket').rooms;

function init (app) {
	app.get('/chat', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
			sendData.user_name = req.session.userData.user_name;
			console.log('내정보 : ', req.session.userData);
			res.render('chat/lobby', sendData);
		});
	});

	app.post('/chat', function (req, res) {
		res.send({'rooms': rooms});
	});

	app.get('/chat/:room_id', function (req, res) {
		lib.checkLogin(req, res, () => {
			let sendData = {};
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

			sendData.room_id = room_id;
			sendData.rooms = rooms;
			sendData.user_name = req.session.userData.user_name;

			res.render('chat/chatRoom', sendData);
		});
	});
}
exports.init = init;