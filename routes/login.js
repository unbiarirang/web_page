var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.get('/signUp', function(req, res, next) {
    res.render('signUp');
});

router.get('/changePw', function(req, res, next) {
    res.render('changePw');
});

router.get('/lostPw', function(req, res, next) {
    res.render('lostPw');
});

module.exports = router;