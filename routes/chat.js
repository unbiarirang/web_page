"use strict"

function init (http) {
    let io = require('socket.io')(http);

    io.on('connection', function (socket) {
        socket.on('addme', function (name) {
            socket.broadcast.emit('chat', 'SERVER: ' + name + ' 님이 입장하셨습니당.');
            socket.name = name;
        });

        socket.on('chat', function (msg) {
            console.log('message from ' + socket.name + ': ' + msg);
            io.emit('chat', socket.name + ': ' + msg);
        });
    });
}
exports.init = init;