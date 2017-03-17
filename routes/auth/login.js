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
        let user_pw;

        async.waterfall([
            (callback) => {
                req.cache.hexists('user', input_id, (err, result) => {
                    if (err) callback (err);

                    if (result != 1)
                        return res.render('auth/login', { error: 'Wrong Id!' });

                    callback();
                })
            },
            (callback) => {
                req.cache.hget('user', input_id, (err, result) => {
                    if (err) callback(err);

                    user_pw = result;

                    if (input_pw != user_pw)
                        return res.render('auth/login', { error: 'Wrong password!' });

                    callback();
                });
            }
        ], (err, result) => {
            console.log('로그인 성공');
            res.redirect('/menu');
        });
    });
}
exports.init = init;