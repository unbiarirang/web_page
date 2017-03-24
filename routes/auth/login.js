"use strict"

const
    async = require('async'),
    bcrypt = require('bcrypt'),

    lib = require('../../lib/lib');

let sessionMap = lib.getSessionMap();

function init(app) {
    let prev_path;

    app.get('/login', function (req, res) {
        prev_path = req.query.prev_path;
        res.render('auth/login');
    });

    /**
     * TODO.
     * 클라이언트단에서 패스워드가 평문으로 오기 때문에
     * 무조건 https로 바꿔줘야 한다.
     */
    app.post('/login', function (req, res) {
        let input_id = req.body.input_id;
        let input_pw = req.body.input_pw;

        let multi = req.cache.multi();

        multi.hget('user', input_id);
        multi.hget('ID::' + input_id, 'name');
        multi.exec(function (err, results) {
            if (err) throw err;

            let hash = results[0];
            let user_name = results[1];

            if (!hash || !user_name) return res.render('auth/login', { error: 'Wrong Id or Password!' });

            bcrypt.compare(input_pw, hash, function (err, result) {
                if (err) throw err;
                if (!result) return res.render('auth/login', { error: 'Wrong Id or Password!' });

                if (sessionMap.hasOwnProperty(input_id))
                delete sessionMap[input_id];

                let session_key = lib.getRandomNum();
                sessionMap[input_id] = session_key;

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
    });
}
exports.init = init;
exports.sessionMap = sessionMap;