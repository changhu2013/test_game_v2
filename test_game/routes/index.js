var express = require('express');
var mongoose = require('mongoose');
var url = require('url');

require('../models/user.js');
var User = mongoose.model('User');

var router = express.Router();
router.get('/', function (req, res) {
    var query = url.parse(req.url, true).query;
    var sid = query.sid;
    console.log('sid:' + sid);

    if (req.session && req.session.user && (sid == req.session.user.sid)) {
        res.render('index', {user: req.session.user});
    } else {
        if (sid == undefined) {
            req.flash('success', '错误的sid');
            res.render('index');
        } else {
            User.findOne({
                sid: sid
            }, function (err, user) {
                console.log("当前登陆信息:" + JSON.stringify(user));
                console.log(err);
                if (err || user == null) {
                    req.session.user = null;
                    req.flash('success', '未找到sid:' + sid + '的用户');
                    res.render('index');
                } else {
                    req.flash('success', '登陆成功');
                    console.log('【' + sid + '】登陆成功');
                    req.session.user = user;
                    res.render('index', {user: req.session.user});
                }
            });
        }
    }
});

router.get('/templates/tabs', function (req, res) {
    res.render('templates-tabs');
});

router.get('/templates/tab/home', function (req, res) {
    var user = req.session && req.session.user ? req.session.user : null;
    res.render('templates-tab-home', {user: user});
});

router.get('/templates/tab/honor', function (req, res) {
    res.render('templates-tab-honor');
});

router.get('/templates/tab/mybattles', function (req, res) {
    res.render('templates-tab-mybattles');
});

router.get('/templates/tab/other', function (req, res) {
    var user = req.session && req.session.user ? req.session.user : null;
    res.render('templates-tab-other', {user : user});
});


/**************************  以下用于测试  *********************************/
//获取用户列表
router.post('/users', function (req, res) {

    var query = url.parse(req.url, true).query;
    console.log(query);
    var skip = query.skip || 0;
    var limit = query.limit;

    skip = Number(skip);
    limit = Number(limit);

    var users = [];
    for (var i = skip; i < skip+limit; i++) {
        users.push({
            code: 'code_' + i,
            name: '张三_' + i,
            photo : i % 2 == 1 ? '/images/farmer.jpg' : '/images/game.jpg',
            desc : '张三是个好同志，张三是个好同志，张三是个好同志'
            + '张三是个好同志，张三是个好同志，张三是个好同志'
            + '张三是个好同志，张三是个好同志，张三是个好同志'
            + '张三是个好同志，张三是个好同志，张三是个好同志'
            + '张三是个好同志，张三是个好同志，张三是个好同志'
        });
    }

    if(skip > 20){
        users.shift();
    }

    console.log(users.length);
    res.send(users);

});

//获取用户信息
router.post('/users/dept', function(req, res){
    var query = url.parse(req.url, true).query;
    console.log(query);
    var pid = query.pid;

    var nodes = [];
    for(var i = 0 ; i < 6; i++){
        nodes.push({
            id : pid + ' ' + i,
            text : '物理题',
            leaf : i > 4
        });
    }
    res.send(nodes);
})



module.exports = router;