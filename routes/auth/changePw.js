"use strict"

function init(app) {
     app.get('/changePw', function(req, res, next) {
        res.render('auth/changePw');
    });
}
exports.init = init;