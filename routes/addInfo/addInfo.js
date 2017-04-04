"use strict"

const
    lib = require('../../lib/lib');

function init(app) {
    app.get('/addInfo', (req, res) => {
        lib.checkLogin(req, res, () => {
            res.render('addInfo/addInfo');
        });
    });

    app.post('/addInfo', (req, res) => {
        lib.checkLogin(req, res, () => {
            addInfo(req, res, (err) => {
                if (err) throw err;

                return res.render('addInfo/addInfo', { success: 'Add Information Succeeded!' });
            });
        });
    });
}
exports.init = init;

function addInfo (req, res, callback) {
    let key = req.body.input_key;
    let value = req.body.input_value;
    let redis = req.cache;
    
    redis.hset('info', key, value, (err) => {
        callback(err);
    })
}