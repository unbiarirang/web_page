"use strict"

const
    async = require('async');

function init(app) {
    app.get('/login', function (req, res) {
        res.render('auth/login');
    });

    app.post('/login', function (req, res) {
        let input_id = req.body.input_id;
        let input_pw = req.body.input_pw;
        let user_id = input_id;
        let user_pw;
        let user_name;

        async.waterfall([
            (callback) => {
                req.cache.hexists('user', input_id, (err, result) => { // 아이디 맞는지 확인
                    if (err) callback (err);

                    if (result != 1)
                        return res.render('auth/login', { error: 'Wrong Id!' });

                    callback();
                })
            },
            (callback) => {
                req.cache.hget('user', input_id, (err, result) => { // 비밀번호 확인
                    if (err) callback(err);

                    user_pw = result;

                    if (input_pw != user_pw)
                        return res.render('auth/login', { error: 'Wrong password!' });

                    callback();
                });
            },
            (callback) => {
                req.cache.hget('id::' + user_id, 'name', (err, result) => { // 해당 유저 정보 읽기
                    if (err) callback(err);

                    user_name = result;

                    callback();
                });
            }
        ], (err, result) => {
            console.log('로그인 성공');
            req.session.userData = {
                'user_id': user_id,
                'user_name': user_name
            };
            res.redirect('/menu');
        });
    });
}
exports.init = init;