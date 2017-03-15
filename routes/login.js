"use strict"

const
    express = require('express');

function init(app) { 
    app.get('/', function(req, res, next) {
        res.render('index');
    });

    app.get('/login', function(req, res, next) {
        res.render('login');
    });

    app.get('/signUp', function(req, res, next) {
        console.log('bbb');
        res.render('signUp');
    });

    app.post('/signUp', function(req, res, next) {
        let user_id = req.body.user_id;
        let user_name = req.body.user_name;
        let user_pw = req.body.user_pw;

         req.cache.hgetall('dad', (err, results) => {
            console.log(results);
        });

        res.send({'resultData': 1});
    });

    app.get('/changePw', function(req, res, next) {
        res.render('changePw');
    });

    app.get('/lostPw', function(req, res, next) {
        res.render('lostPw');
    });
}
exports.init = init;