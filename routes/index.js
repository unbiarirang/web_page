"use strict"
let path = require('path');

function init(app) { 
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/menu',  function (req, res) {
        res.render('menu');
    });

    app.get('/chat', function (req, res) {
        // res.sendFile(path.join(__dirname, '..', 'public/chat.html'));
        //res.redirect('/chat/user/' + req.session.userData.name);
        let user_name = req.session.userData.user_name;
        res.render('chat', {user_name: user_name});
    });

    require('./auth/login').init(app);
    require('./auth/signUp').init(app);
    require('./auth/changePw').init(app);
    require('./auth/findPw').init(app);

    require('./addInfo').init(app);
}
exports.init = init;