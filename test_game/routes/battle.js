var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
var util = require('../models/util.js');
var fs = require('fs');
var Setting = require('../models/setting.js');
var BattleIo = require('../models/BattleIo.js')


require('../models/battle.js');
require('../models/questionstore.js');
require('../models/storebattle.js');

var router = express.Router();
var Battle = mongoose.model('Battle');
var QuestionStore = mongoose.model('QuestionStore');
var StoreBattle = mongoose.model('StoreBattle');
var User = mongoose.model('User');

//题集生成的保存目录
var questionStoreDir = global.questionStoreDir;

/*var questionBattleData = {
 //战场ID
 bid: {
 users: {
 sid: {
 qsid : 'xxxxx',
 //道具数量
 property: 2,
 //进度
 progress: 50,
 //连续答对的题目
 serialValidity: 0,
 //答对题目
 validity:[],

 //打错题目
 mistake: [],

 //状态: I-正在进行 E-跑路 C-完成
 status: 'I'
 }
 }
 }
 };*/

//最近参加的战区
router.post('/laststore', function(req, res) {
    var query = url.parse(req.url, true).query,
        skip = query.skip || 0,
        limit = query.limit || 10;
    var user = req.session.user;
    StoreBattle.find({
        sid : user.sid
    }).sort({
        lastTime : -1
    }).skip(skip).limit(limit).exec(function(err, battles){
        battles = util.toJSON(battles);
        var qsids = [];
        for(var k = 0; k < battles.length; k++){
            var b = battles[k];
            qsids.push(b.qsid);
        }
        QuestionStore.find({
            _id : {
                $in : qsids
            }
        }, function(err, stores){
            stores = util.toJSON(stores);
            for(var i = 0; i < battles.length; i++){
                var b = battles[i];
                for(var j = 0 ;j < stores.length; j++){
                    var s = stores[j];
                    if(b.qsid == s._id){
                        var msg = BattleIo.getBattleMsg(b.qsid);
                        var count = 0;
                        for(var bid in msg){
                            for(var sid in msg[bid]){
                                count++;
                            }
                        }
                        s.onLineUserNum = count;
                        b.store = s;
                        break;
                    }
                }
            }
            res.send(battles);
        });
    });
});

//我的挑战
router.post('/new', function(req, res){
    console.log('new battles....');
    var user = req.session.user;
    Battle.find({
        status : 'N',
        sid : user.sid
    }, function(err, battles){
        res.send(util.toJSON(battles));
    });
});

//获取某题集下的正在进行的挑战
router.post('/qstore', function(req, res){
    var query = url.parse(req.url, true).query;
    var qsid = query.qsid;
    var skip = query.skip || 0;
    var limit = query.limit || 5;
    console.log(query);
    Battle.find({
        qsid : qsid,
        status : 'I'
    }).skip(skip).limit(limit).exec(function(err, battles){
        console.log(battles);

        res.send(util.toJSON(battles));
    });
});

router.post('/getWarzoneData', function (req, res) {
    var query = req.query;
    var qsid = query.qsid;
    var skip = query.skip || 0;
    var limit = query.limit || 5;
    var qsData = BattleIo.getBattleMsg(qsid)
    var timer = 0;
    var data = [];
    for(var p in qsData){
        var bData = {};
        //bData[p] = [];
        bData['bid'] = p;
        bData['users'] = [];
        if(timer == skip && timer < limit){
            for(var attr in qsData[p]){
                bData['users'].push({
                    sid: attr,
                    name: qsData[p][attr]['name']
                });
            }
        }
        data.push(bData);
        if(timer >= limit){
            break;
        }
        timer++;
    }
    console.log('获取战场列表:  ' + data);
    res.send(data);
})

//战场
router.get('/battle/:qs_id/:bid', function(req, res){
    /*console.log('战场');
    //1.拿到题集编号
    var qs_id = req.params.qs_id;
    //2.通过题集编号去获取试卷号:然后随机一套试卷
    var paperId = parseInt(Math.random() * parseInt(Setting.get('paperNum'))); //试卷ID
    var path = questionStoreDir + qs_id + '\\' + paperId + '.json';
    var data=fs.readFileSync(path, "utf-8");
    console.log(data);
    res.render('drillwar', {
        users: [req.session.user],
        qStore: JSON.parse(data) //题目
    });*/
    var qs_id = req.params.qs_id;
    var bid = req.params.bid;
    var sid = req.session.user.sid;
    console.log(sid + " 加入战场");
    QuestionStore.findById(qs_id, function (err, questionStoreData) {
        if (err) throw err;
        BattleIo.joinBattle(qs_id, bid, sid, req.session.user.name);
        res.render('battle', {
            qsid: qs_id,
            bid: bid,
            startBtn : false,
            qstitle: questionStoreData.get('title')
        });
    });
});


//练兵场
router.get('/drillwar/:qs_id', function(req, res){
    //1.拿到题集编号
    var qs_id = req.params.qs_id;
    //2.通过题集编号去获取试卷号:然后随机一套试卷
    var paperId = parseInt(Math.random() * parseInt(Setting.get('paperNum'))); //试卷ID
    var path = questionStoreDir + qs_id + '\\' + paperId + '.json';
    var questionData = fs.readFileSync(path, "utf-8");

    QuestionStore.findById(qs_id, function (err, questionStoreData) {
        if(err) throw err;
        //存储对战信息
        var nowTime = new Date();
        var battle = new Battle();
        battle['sid'] = req.session.user.sid;
        battle['sname'] = req.session.user.name;
        battle['status'] = 'I'; //正在进行状态
        battle['qsid'] = qs_id; //题集ID
        battle['qstitle'] = questionStoreData.get('title');
        battle['start'] = nowTime;//挑战开始时间

        battle.save(function (err, battleData) {
            //该战役的ID
            var bid = battleData.get('_id').toString();
            var sid = req.session.user.sid;
            StoreBattle.findOne({'sid': sid}, function (err, storeBattleData) {
                if(storeBattleData){
                    StoreBattle.update({
                        sid: sid,
                        name: req.session.user.name,
                        qsid: qs_id,
                        qtitle: questionStoreData.get('title'),
                        bid: bid,
                        lastTime: battleData.get('start')
                    }, function (err, data) {
                        //加入练习场
                        BattleIo.joinDrill(qs_id, sid);
                        res.render('drillwar', {
                            user: req.session.user,
                            bid: bid,
                            qstitle: questionStoreData.get('title'),
                            qStore: JSON.parse(questionData), //题目
                            paperNum: Setting.get('battleQuestionNum')
                        });
                    });
                } else {
                    var storeBattle = new StoreBattle();
                    storeBattle['sid'] = sid;
                    storeBattle['qsid'] = qs_id;
                    storeBattle['bid'] = bid;
                    storeBattle['lastTime'] = battleData.get('start');
                    storeBattle.save(function (err , data) {
                        //加入练习场
                        BattleIo.joinDrill(qs_id, sid);
                        res.render('drillwar', {
                            user: req.session.user,
                            bid: bid,
                            qstitle: questionStoreData.get('title'),
                            qStore: JSON.parse(questionData), //题目
                            paperNum: Setting.get('battleQuestionNum')
                        });
                    });
                }
            });
        });
    });
});


//检查分数
router.post('/validateScore', function (req, res) {
    //先检查分数够不够
    var sid = req.session.user.sid;
    User.findOne({sid: sid}, function (err, userData) {
        var score = userData.get('score') || 0;
        if(parseInt(score) < parseInt(Setting.get('battleEntryFee'))){
            res.send({
                success: false,
                msg: '您当前的分数不够建立战场，请先进行练习场赚取积分。'
            });
        } else {
            res.send({
                success: true,
                msg: ''
            });
        }
    });
});

//创建战场-并保存战场状态
router.get('/createBattle/:qs_id', function (req, res) {
    var sid = req.session.user.sid;
    var qs_id = req.params.qs_id;
    QuestionStore.findById(qs_id, function (err, questionStoreData) {
                if(err) throw err;
                var battle = new Battle();
                battle['sid'] = req.session.user.sid;
                battle['sname'] = req.session.user.name;
                battle['status'] = 'W'; //正在进行状态(等待)
                battle['qsid'] = qs_id; //题集ID
                battle['qstitle'] = questionStoreData.get('title');

                battle.save(function (err, battleData) {
                    if(err) throw err;
                    //该战役的ID
                    var bid = battleData.get('_id').toString();
                    BattleIo.joinBattle(qs_id, bid, sid, req.session.user.name);

                    console.log("当前战役ID:" + bid);

                    res.render('battle', {
                        qsid: qs_id,
                        bid: bid,
                        startBtn : true,
                        qstitle: questionStoreData.get('title')
                    });
                });
            });
});

//初始化战场信息
router.post('/initBattleData', function (req, res) {
    var qsId = req.query.qsid;
    var bid = req.query.bid;

    console.log("initBattleData: " + JSON.stringify(BattleIo.battleData));

    res.send(BattleIo.getBattleMsg(qsId, bid));
});

//由创建人点击开始按钮后开始
router.post('/startBattleForCreater', function (req, res) {
    var qsId = req.query.qsid;
    var bid = req.query.bid;
    var sid = req.session.user.sid;
    var name = req.session.user.name;

    var battleData = BattleIo.getBattleMsg(qsId, bid);
    var users = [];
    for(var p in battleData){
        if(p != sid){
            users.push({
                sid: p,
                name: battleData[p]['name']
            });
        }
    }

    Battle.findByIdAndUpdate(bid, {
        status: 'I', //正在进行状态(正在进行)
        start: new Date(),
        rivals: users
    }, {}, function (err , battleData) {
        if(err) throw err;
        //通过题集编号去获取试卷号:然后随机一套试卷
        var paperId = parseInt(Math.random() * parseInt(Setting.get('paperNum'))); //试卷ID
        var path = questionStoreDir + qsId + '\\' + paperId + '.json';
        var questionData = fs.readFileSync(path, "utf-8");
        StoreBattle.findOne({'sid': sid}, function (err, storeBattleData) {
            if(err) throw err;
            if(storeBattleData){
                StoreBattle.update({
                    qsid: qsId,
                    qtitle: battleData.get('qstitle'),
                    bid: bid,
                    lastTime: new Date()
                }, function (err, data) {
                    if(err) throw err;
                    User.findOne({
                        sid: sid
                    } , function (err, userData) {
                        var score = userData.get('score'); //当前分数
                        userData.update({
                            score : parseInt(score) - parseInt(Setting.get('battleEntryFee'))
                        }, function (err, userData2) {
                            BattleIo.startBattle(qsId, bid, sid);
                            res.send(JSON.parse(questionData)) //题目
                        });
                    });
                });
            } else {
                var storeBattle = new StoreBattle();
                storeBattle['sid'] = sid;
                storeBattle['bid'] = bid;
                storeBattle['name'] = name;
                storeBattle['qsid'] = qsId;
                storeBattle['qtitle']= battleData.get('qstitle');
                storeBattle['lastTime'] = new Date();
                storeBattle.save(function (err , data) {
                    if(err) throw err;
                    User.findOne({
                        sid: sid
                    } , function (err, userData) {
                        var score = userData.get('score'); //当前分数
                        userData.update({
                            score : parseInt(score) - parseInt(Setting.get('battleEntryFee'))
                        }, function (err, userData2) {
                            BattleIo.startBattle(qsId, bid, sid);
                            res.send(JSON.parse(questionData)) //题目
                        });
                    });
                });
            }
        });

    });
});

//由创建人点击开始按钮后开始
router.post('/startBattle', function (req, res) {
    var qsId = req.query.qsid;
    var bid = req.query.bid;
    var sid = req.session.user.sid;
    var name = req.session.user.name;

    var paperId = parseInt(Math.random() * parseInt(Setting.get('paperNum'))); //试卷ID
    var path = questionStoreDir + qsId + '\\' + paperId + '.json';
    var questionData = fs.readFileSync(path, "utf-8");
    StoreBattle.findOne({'sid': sid}, function (err, storeBattleData) {
        if(err) throw err;
        if(storeBattleData){
            QuestionStore.findById(qsId, function (err, qsdata) {
                StoreBattle.update({
                    qsid: qsId,
                    qtitle: qsdata.get('title'),
                    bid: bid,
                    lastTime: new Date()
                }, function (err, data) {
                    if(err) throw err;
                    User.findOne({
                        sid: sid
                    } , function (err, userData) {
                        var score = userData.get('score'); //当前分数
                        User.update({
                            score : parseInt(score) - parseInt(Setting.get('battleEntryFee'))
                        }, function (err, userData2) {
                            BattleIo.getBattleMsg(qsId, bid, sid)['start'] = new Date();
                            res.send(JSON.parse(questionData)) //题目
                        });
                    });
                });
            })
        } else {
            QuestionStore.findById(qsId, function (err, qsdata) {
                var storeBattle = new StoreBattle();
                storeBattle['sid'] = sid;
                storeBattle['bid'] = bid;
                storeBattle['name'] = name;
                storeBattle['qsid'] = qsId;
                storeBattle['qtitle']= qsdata.get('title');
                storeBattle['lastTime'] = new Date();
                storeBattle.save(function (err , data) {
                    if(err) throw err;
                    User.findOne({
                        sid: sid
                    } , function (err, userData) {
                        var score = userData.get('score'); //当前分数
                        User.update({
                            score : parseInt(score) - parseInt(Setting.get('battleEntryFee'))
                        }, function (err, userData2) {
                            BattleIo.getBattleMsg(qsId, bid, sid)['start'] = new Date();
                            res.send(JSON.parse(questionData)) //题目
                        });
                    });

                });
            });
        }
    });
});


//我的挑战
router.post('/mybattles', function(req, res){
    var query = url.parse(req.url, true).query;
    console.log(query);
    var skip = query.skip || 0;
    var limit = query.limit  || 10;
    var sid = req.session.user.sid;
    Battle.find({
        sid : sid
    }).skip(skip).limit(limit).exec(function(err, battles){
        battles = util.toJSON(battles);
        var qsids = [];
        for(var i = 0, len = battles.length; i < len; i++){
            qsids.push(battles[i].qsid);
        }
        QuestionStore.find({
            _id : {
                $in : qsids
            }
        }, function(err, stores){
            stores = util.toJSON(stores);
            for(var i = 0; i < battles.length; i++){
                var b = battles[i];
                for(var j = 0 ;j < stores.length; j++){
                    var s = stores[j];
                    if(b.qsid == s._id){
                        b.store = s;
                        break;
                    }
                }
            }
            res.send(battles);
        });
    });
});


module.exports = router;
