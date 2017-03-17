"use strict"

function init(app) {
    app.get('/signUp', function(req, res) {
        res.render('auth/signUp');
    });

    app.post('/signUp', function(req, res) {
        let user_id = req.body.user_id;
        let user_name = req.body.user_name;
        let user_pw = req.body.user_pw;

        res.redirect('/');
        //res.send({'result': 1});

        // req.cache.hset('user', user_id, user_pw, (err, result) => {
        //     if (err) throw err;

        //     console.log('회원 가입 성공');
        //     res.render('index', { resultData: 1 });
        // });
    });
}
exports.init = init;