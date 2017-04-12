"use strict"

const
    async = require('async'),
    bcrypt = require('bcrypt'),
    lib = require('../../lib/lib');
const
    saltRounds = 12;

function init(app) {
    app.get('/signUp', function(req, res) {
        res.render('auth/signUp');
    });

    app.post('/signUp', function(req, res) {
        let user_id = req.body.user_id;
        let user_email = req.body.user_email;
        let user_pw = req.body.user_pw;

        bcrypt.hash(user_pw, saltRounds, function (err, hash) {
            if (err) throw err;

            req.cache.hexists('USER', user_id, (err, result) => {
                if (err) throw err;
                if (result == 1) return res.send({'result': 'invalidId'}); //동일한 아이디 이미 존재

                let user_uuid = lib.makeUUID();

                let multi = req.cache.multi();
                multi.hset('USER', user_id, user_uuid);
                multi.hmset('UUID::' + user_uuid, 'id', user_id, 'password', hash, 'email', user_email);
                multi.exec(function (err) {
                    if (err) throw err;

                    return res.send({'result': 1});
                });
            });
        });        
    });
} 
exports.init = init;