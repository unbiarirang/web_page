"use strict"
const
	rooms = require('./socket').rooms;

function init (app) {
    app.get('/chat', function (req, res) {
		let sendData = {};
		sendData.user_name = req.session.userData.user_name;
		sendData.rooms = rooms;
        res.render('chat/chat', sendData);
    });

	app.get('/chat/:room_name', function (req, res) {
		let sendData = {};
		sendData.room_name = req.params.room_name;
		sendData.user_name = req.session.userData.user_name;

		res.render('chat/chatRoom', sendData);
	});
}
exports.init = init;