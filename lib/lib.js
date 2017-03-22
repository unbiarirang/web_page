"use strict"

let id = 1;

function getRoomId() {
    return id++;
}
exports.getRoomId = getRoomId;