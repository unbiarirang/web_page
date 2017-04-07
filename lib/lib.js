"use strict"

const
    global = require('./global'),
    url = require('url');

let id = 1;

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
    return id++;
}
exports.getRoomId = getRoomId;