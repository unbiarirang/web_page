"use strict"

const
    nodemailer = require('nodemailer'),
    transport = require('nodemailer-smtp-transport'),
    async = require('async'),

    config = require('../../../config/config'), //config 나중에 수정

    NOT_EXIST_ID = '존재하지 않는 아이디';

/**
 * 큰일났다. 패스워드 찾기는 사용할 수 없다.
 * 왜냐. bcrypt가 해싱을 한거지 encrypt를 한게 아니라 decrypt 자체를 할 수 없다.
 * 사실 보안상으로도 패스워드를 보내주는 것보다 패스워드 리셋 메일을 보내는 것이 좋다.
 * 일단 내비 두고 나중에 하자. TODO.
 */
function init(app) {
    app.get('/findPw', function (req, res) {
        res.render('auth/findPw');
    });

    app.post('/findPw', function (req, res) {
        async.waterfall([
            (callback) => {
                getEmail(req, res, (err, email) => {
                    callback(err, email);
                });
            },
            (email, callback) => {
                getPw(req, res, (err, pw) => {
                    callback(err, email, pw);
                });
            },
            (email, pw, callback) => {
                sendMail(email, pw, (err) => {
                    callback(err);
                });
            }
        ], (err) => {
            if (err == NOT_EXIST_ID) return res.send({'result': 0});
            if (err) throw err;

            res.send({'result': 1});
        });
    });
}
exports.init = init;

function getEmail (req, res, callback) {
    let user_id = req.body.user_id;
    
    req.cache.hget('ID::' + user_id, 'email', (err, result) => {
        if (!err && !result) err = NOT_EXIST_ID;

        callback(err, result);
    });
}

function getPw (req, res, callback) {
    let user_id = req.body.user_id;

    req.cache.hget('user', user_id, (err, result) => {
        callback(err, result);
    });
}

function sendMail (email, pw, callback) {
    let smtpTransport = nodemailer.createTransport(transport({  
        service: 'Gmail',
        auth: {
            user: 'ebchoi1030@gmail.com',
            pass: config.gmailPw
        }
    }));

    var mailOptions = {  
        from: 'loveme <unbiarirang@naver.com>', 
        to: email,
        subject: '너의 패스워드를 내가 찾아줄게',
        //text: '텍스트'
        html: '<h1>이거 비밀번호 해싱값이다 ㅋㅋ</h1><p>너의 패스워드는 ' + pw + '</p>'
    }

    smtpTransport.sendMail(mailOptions, function (err) {
        smtpTransport.close();

        callback(err);
    });
}