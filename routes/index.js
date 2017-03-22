"use strict"

const
    path = require('path');

function init(app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/menu', function (req, res) {
        res.render('menu');
    });

    app.get('/profile', function (req, res) {
        res.sendFile(path.join(__dirname, '..', 'public/profile.html'));
    });

    require('./auth/login').init(app);
    require('./auth/signUp').init(app);
    require('./auth/changePw').init(app);
    require('./auth/findPw').init(app);

    require('./chat/chat').init(app);

    require('./addInfo/addInfo').init(app);
}
exports.init = init;