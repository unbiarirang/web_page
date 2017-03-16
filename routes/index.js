"use strict"

function init(app) { 
    app.get('/', function(req, res) {
        res.render('index');
    });

    require('./auth/login').init(app);
    require('./auth/signUp').init(app);
    require('./auth/changePw').init(app);
    require('./auth/findPw').init(app);
}
exports.init = init;