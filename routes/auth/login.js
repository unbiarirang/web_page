"use strict"

function init(app) {
    app.get('/login', function (req, res) {
        res.render('auth/login');
    });

    app.post('/login', function (req, res) {
        let input_id = req.body.input_id;
        let input_pw = req.body.input_pw;
        let user_pw;

        req.cache.hget('user', input_id, (err, result) => {
            if (err) throw err;

            console.log('reids hget result:', result);
            user_pw = result;

            if (input_pw != user_pw) {
                return res.render('auth/login', { error: 'Wrong password!' });
            }

            console.log('로그인 성공임');
            res.redirect('/home');
        });
    });
}
exports.init = init;