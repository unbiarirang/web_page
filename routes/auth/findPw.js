"use strict"

function init(app) {
    app.get('/findPw', function(req, res, next) {
        res.render('auth/findPw');
    });
}
exports.init = init;