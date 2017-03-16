"use strict"
let path = require('path');

function init(app) { 
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/home',  function (req, res) {
        res.render('home');
    });

    app.get('/chat', function (req, res) {
        res.sendFile(path.join(__dirname, '..', 'public/chat.html'));
    });

    require('./auth/login').init(app);
    require('./auth/signUp').init(app);
    require('./auth/changePw').init(app);
    require('./auth/findPw').init(app);
}
exports.init = init;