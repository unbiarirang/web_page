"use strict"

const
    async = require('async'),
    bcrypt = require('bcrypt'),

    lib = require('../../lib/lib'),
    global = require('../../lib/global');

let sessionMap = global.getSessionMap();

function init(app) {
    let prev_path;

    app.get('/login', function (req, res) {
        prev_path = req.query.prev_path;
        res.render('auth/login');
    });

    /**
     * TODO.
     * 클라이언트단에서 서버로 패스워드가 평문으로 오기 때문에
     * 무조건 https로 바꿔줘야 한다.
     */
    app.post('/login', function (req, res) {
        let input_id = req.body.input_id;
        let input_pw = req.body.input_pw;

        req.cache.hget('USER', input_id, (err, result) => {
            if (err) throw err;

            let user_uuid = result;
            if (!user_uuid) return res.render('auth/login', { error: 'Wrong Id or Password!' });

            let multi = req.cache.multi();
            multi.hget('UUID::' + user_uuid, 'password');
            multi.hget('UUID::' + user_uuid, 'id');
            multi.exec(function (err, results) {
                if (err) throw err;

                let password = results[0];
                let user_id = results[1];

                bcrypt.compare(input_pw, password, function (err, result) {
                if (err) throw err;
                if (!result) return res.render('auth/login', { error: 'Wrong Id or Password!' });

                //세션 설정
                if (sessionMap.hasOwnProperty(user_id))
                delete sessionMap[user_id];

                let session_key = lib.getRandomNum();
                sessionMap[user_id] = session_key;

                console.log('sessionMap : ', sessionMap);

                req.session.userData = {
                    'user_id': user_id,
                    'user_uuid': user_uuid,
                    'session_key': session_key
                }

                //쿠키 설정
                if (!req.cookies || req.cookies.user_id != user_id) {   //쿠키가 없었거나 다른 아이디로 로그인했을 때 새로 만듬
                    let cookie_duration_time = 90 * 24 * 60 * 60 * 1000; 
                    let option = {
                        maxAge: cookie_duration_time,                   //쿠키 90일간 지속
                        httpOnly: true                                  //웹서버에서만 접근 가능
                    }
                    res.cookie('cookie_id',lib.getRandomNum(), option);
                    res.cookie('user_id', user_id, option); 
                }

                if (prev_path == '' || prev_path == 'undefined' || prev_path == null)
                    res.redirect('/menu');
                else
                    res.redirect(prev_path);
                });
            });
        });
    });
}
exports.init = init;
exports.sessionMap = sessionMap;