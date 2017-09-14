"use strict"

const
    path = require('path'),
    lib = require('../lib/lib');

var exec = require('child_process').execFile;

function init(app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/menu', function (req, res) {
        lib.checkLogin(req, res, () => {
            res.render('menu');
        });
    });

    app.get('/profile', function (req, res) {
        lib.checkLogin(req, res, () => {
            res.sendFile(path.join(__dirname, '..', 'public/profile.html'));
        });
    });

    app.get('/gwent', function (req, res) {
        lib.checkLogin(req, res, () => {
            console.log("gwent exe start");
                exec('../gwent/gwent/bin/gwent.exe', function(err, data) {  
                    console.log(err)
                    console.log(data.toString());                       
            });  
        });
    });

    require('./auth/login').init(app);
    require('./auth/signUp').init(app);
    require('./auth/findPw').init(app);

    require('./chat/chat').init(app);

    require('./addInfo/addInfo').init(app);
}
exports.init = init;