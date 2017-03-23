"use strict"

const
    nodemailer = require('nodemailer'),
    transport = require('nodemailer-smtp-transport'),
    async = require('async'),

    config = require('../../../config/config'), //config 나중에 수정

    NOT_EXIST_ID = '존재하지 않는 아이디';

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
        //text: '실제 이케하면 안됨'
        html: '<h1>실제 이케하면 안됨</h1><p>그래도 너의 패스워드는 ' + pw + '</p>'
    }

    smtpTransport.sendMail(mailOptions, function (err) {
        smtpTransport.close();

        callback(err);
    });
}