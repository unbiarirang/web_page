"use strict"

function init (http) {
    let io = require('socket.io')(http);
    let rooms = ['room1', 'room2', 'room3'];
    let userlist = {};

    io.on('connection', function (socket) {
        socket.on('adduser', function (name) {
            socket.broadcast.emit('chat', 'SERVER: ' + name + ' 님이 입장하셨습니당.');
            socket.name = name;
            socket.room 
        });

        socket.on('chat', function (msg) {
            console.log('message from ' + socket.name + ': ' + msg);
            io.emit('chat', socket.name + ': ' + msg);
        });
    });
}
exports.init = init;