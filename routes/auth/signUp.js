"use strict"

const
    async = require('async');

function init(app) {
    app.get('/signUp', function(req, res) {
        res.render('auth/signUp');
    });

    app.post('/signUp', function(req, res) {
        let user_id = req.body.user_id;
        let user_name = req.body.user_name;
        let user_email = req.body.user_email;
        let user_pw = req.body.user_pw;
        
        req.cache.hexists('user', user_id, (err, result) => {
            if (err) throw err;
            if (result == 1) return res.send({'result': -1}); //동일한 아이디 이미 존재

            let multi = req.cache.multi();
            multi.hset('user', user_id, user_pw);
            multi.hmset('ID::' + user_id, 'name', user_name, 'email', user_email);
            multi.exec(function (err, results) {
                if (err) throw err;

                return res.send({'result': 1});
            });
        });
    });
}
exports.init = init;