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
        let user_email = req.body.email;
        let user_pw = req.body.user_pw;
        
        console.log(user_name);
        throw 404;
    
        req.cache.hset('user', user_id, user_pw, (err, result) => {
            if (err) throw err;
            if (result == 0) 
                return res.send({'result': 0});

            req.cache.hmset('ID::' + user_id, 'name', user_name, 'email', user_email, (err, result) => {
                if (err) throw err;
                if (result == 0)
                    return res.send({'result': -1});

                return res.send({'result': 1});
            });
        });
    });
}
exports.init = init;