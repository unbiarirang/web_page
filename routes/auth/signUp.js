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
        let user_pw = req.body.user_pw;
    
        req.cache.hset('user', user_id, user_pw, (err, result) => {
                if (err) throw err;
                if (result == 0) 
                    return res.send({result: 0});

                console.log('회원 가입 성공');
                return res.send({result: 1});
        });
    });
}
exports.init = init;