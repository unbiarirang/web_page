"use strict"

//전역변수는 클로저 이용하면 좋으니까
let sessionMap = {};
let rooms = {};
let userlist = {};

function getSessionMap () {
    return sessionMap; 
}
exports.getSessionMap = getSessionMap;

function getRoomList () {
    return rooms;
}
exports.getRoomList = getRoomList;

function getUserList () {
    return userlist;
}
exports.getUserList = getUserList;