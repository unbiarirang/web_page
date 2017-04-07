"use strict"

let sessionMap = {};
let rooms = {};

function getSessionMap () {
    return sessionMap; //전역변수는 클로저 이용하면 좋으니까
}
exports.getSessionMap = getSessionMap;

function getRoomList () {
    return rooms;
}
exports.getRoomList = getRoomList;