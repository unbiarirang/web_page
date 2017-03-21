"use strict"
let rooms = {};
let userlist = {};

function init (http) {
    let io = require('socket.io')(http);


    io.on('connection', function (socket) {
        socket.on('adduser', function (data) {
            let user_name = data.user_name;
            let room_name = data.room_name;

            socket.user_name = user_name;
            socket.room_name = room_name;

            if (room_name == user_name) {               //새로운방 생성. 방 이름은 자기 닉네임
                let room = {};
                room.userlist = [];
                room.userlist.push(user_name);
                rooms[room_name] = room;
                userlist[user_name] = room_name;
            }
            else {                                      //기존 채팅방에 입장
                let room = rooms[room_name];
                room.userlist.push(user_name);
                userlist[user_name] = room_name;
            }

            console.log('rooms:', rooms, '\n userlist: ', userlist);
            socket.join(room_name);
            socket.broadcast.to(room_name).emit('chat', 'SERVER: ' + user_name + ' 님이 ' + room_name + ' 방에 입장하셨습니당.');
        });

        socket.on('chat', function (msg) {
            console.log('message from ' + socket.user_name + ': ' + msg);
            io.sockets.in(socket.room_name).emit('chat', socket.user_name + ': ' + msg);
        });

        socket.on('disconnect', function() {
            let user_name = socket.user_name;
            let room_name = socket.room_name;

            delete userlist[user_name];                     //글로벌 유저 리스트에서 자신 삭제

            if (rooms[room_name].userlist.length == 1)      //혼자 있으니 채팅방 삭제
                delete rooms[room_name];
            else {                                          //채팅방 유저 리스트에서 자신 삭제
                let index = rooms[room_name].userlist.indexOf(user_name);
                rooms[room_name].userlist.splice(index, 1);
            }

            console.log('rooms:', rooms, '\n userlist: ', userlist);
            socket.broadcast.to(room_name).emit('chat', 'SERVER: ' + user_name + ' 님이 퇴장하셨습니당.');
        });
    });
}
exports.init = init;
exports.rooms = rooms;