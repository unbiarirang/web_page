"use strict"

const
    async = require('async'),
    lib = require('../../lib/lib');

let sessionMap = {};

function init(app) {
    let prev_path;

    app.get('/login', function (req, res) {
        prev_path = req.query.prev_path;

        res.render('auth/login');
    });

    app.post('/login', function (req, res) {
        let input_id = req.body.input_id;
        let input_pw = req.body.input_pw;

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

                    if (input_pw != result)
                        return res.render('auth/login', { error: 'Wrong password!' });

                    callback();
                });
            },
            (callback) => {
                req.cache.hget('id::' + input_id, 'name', (err, result) => { // 해당 유저 정보 읽기
                    if (err) callback(err);

                    user_name = result;

                    callback();
                });
            }
        ], (err, result) => {
            if (sessionMap.hasOwnProperty(input_id))
                delete sessionMap[input_id];

            let session_key = lib.getRandomNum();
            sessionMap[input_id] = session_key;
            
            console.log('session_key : ' , session_key);
            console.log('sessionMap : ', sessionMap);

            req.session.userData = {
                'user_id': input_id,
                'user_name': user_name,
                'session_key': session_key
            }

            if (prev_path == '' || prev_path == 'undefined' || prev_path == null)
                res.redirect('/menu');
            else
                res.redirect(prev_path);
        });
    });
}
exports.init = init;
exports.sessionMap = sessionMap;