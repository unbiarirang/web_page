"use strict"

const
    global = require('./global'),
    url = require('url');

let id = 0;
let rooms = global.getRoomList();

function checkLogin (req, res, callback) {
    let sessionMap = global.getSessionMap();
    let prev_path = url.parse(req.url).pathname;

    if (!req.session.userData || (req.session.userData.session_key != sessionMap[req.session.userData.user_id]))
        return res.redirect('/login?prev_path=' + prev_path);

    callback();
}
exports.checkLogin = checkLogin;

function getRandomNum () {
    return Math.floor(Math.random() * 90000000000) + 10000000000;
}
exports.getRandomNum = getRandomNum;

function getRoomId () {
    ++id;

    for (let key in rooms) { //중복이면 새로운 아이디 받기
        if (key == id) {
            getRoomId();
            break;
        }
    }

    return id;
}
exports.getRoomId = getRoomId;