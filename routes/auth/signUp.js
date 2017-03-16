"use strict"

function init(app) {
    app.get('/signUp', function(req, res) {
        res.render('auth/signUp');
    });

    app.post('/signUp', function(req, res) {
        let user_id = req.body.user_id;
        let user_name = req.body.user_name;
        let user_pw = req.body.user_pw;

        req.cache.hset('user', user_id, user_pw, (err, result) => {
            if (err) throw err;

            console.log('레디스 저장 성공', result);
            res.send({'resultData': 1});
        });
    });
}
exports.init = init;