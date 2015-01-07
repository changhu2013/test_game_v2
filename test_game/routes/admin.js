
/*
 *  后台管理页面，进行系统设置和用户信息，题目信息的导入
 */
var os = require('os');
var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');
var moment = require('moment');

var fileutil = require('../models/fileutil');
var Setting = require('../models/setting.js');

//上传相关的中间键
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


var createPaperNum = Setting.get('paperNum'); //每个题集下生成多少套题目
var paperQuestionNum = Setting.get('battleQuestionNum'); //每套题有多少个题

//题集生成的保存目录
var questionStoreDir = global.questionStoreDir;

require('../models/Log.js');
require('../models/user.js');
require('../models/battle.js');
require('../models/storebattle.js');
require('../models/setting.js');
require('../models/questionstore.js');
require('../models/question.js');

var formater = 'YYYY-MM-DD HH:mm:ss';

var Log = mongoose.model('Log');
var Battle = mongoose.model('Battle');
var StoreBattle = mongoose.model('StoreBattle');

var router = express.Router();

router.get('/', function(req, res){
    console.log('admin index');
    res.render('admin');
});

router.get('/settings', function(req, res) {
    res.render('settings', {
        Setting : Setting.getData()
    });
});

router.post('/settings', function(req, res){
    console.log(req.body);
    //保存设置信息
    //时间占比
    var timeScorePct = req.body.timeScorePct;
    if(timeScorePct != undefined){
        Setting.set('timeScorePct', Number(timeScorePct));
    }

    //人数占比
    var userScorePct = req.body.userScorePct;
    if(userScorePct != undefined){
        Setting.set('userScorePct', Number(userScorePct));
    }

    //成功与否占比
    var succScorePct = req.body.succScorePct;
    if(succScorePct != undefined){
        Setting.set('succScorePct', Number(succScorePct));
    }

    //参站报名积分
    var battleEntryFee = req.body.battleEntryFee;
    if(battleEntryFee != undefined){
        Setting.set('battleEntryFee', Number(battleEntryFee));
    }

    //挑战最多人数
    var battleMaxUserNum = req.body.battleMaxUserNum;
    if(battleMaxUserNum != undefined){
        Setting.set('battleMaxUserNum', Number(battleMaxUserNum));
    }

    //挑战最少人数
    var battleMinUserNum = req.body.battleMinUserNum;
    if(battleMinUserNum != undefined){
        Setting.set('battleMinUserNum', Number(battleMinUserNum));
    }

    //成功百分比
    var userSuccPct = req.body.userSuccPct;
    if(userSuccPct != undefined){
        Setting.set('userSuccPct', Number(userSuccPct));
    }

    //每个题集下生成的试卷的数量
    var paperNum = req.body.paperNum;
    if(paperNum != undefined){
        Setting.set('paperNum', Number(paperNum));
    }

    //每个挑战题目数量
    var battleQuestionNum = req.body.battleQuestionNum;
    if(battleQuestionNum != undefined){
        Setting.set('battleQuestionNum', Number(battleQuestionNum));
    }

    res.redirect('/admin#/settings');
});

router.get('/importusers', function(req, res){
    res.render('import_users', {
        success: true,
        msg: '上传成功'
    });
});

router.post('/importusers', multipartMiddleware, function(req, res){
    console.log('import users');
    var temp_path = req.files.file.path;
    if (temp_path) {
        fs.readFile(temp_path, 'utf-8', function(err, content) {
            var users = content.split('\n');
            var User = mongoose.model('User');
            for(var i= 0,len=users.length;i<len;i++){
                var userArr = users[i].split(',');
                var user = new User();
                user.sid = userArr[0];
                user.name = userArr[1];
                user.job = userArr[2];
                user.save(function (err) {
                    if(err) throw err;
                });
            }
            // 删除临时文件
            fs.unlink(temp_path);
        });
    }
    res.redirect('/admin#/importusers');
});

router.get('/importquestions', function(req, res){
    res.render('import_questions');
});

router.post('/importquestions', multipartMiddleware, function(req, res){

    var title = req.body.title;
    var qcid = req.body.qcid;
    var drillScore = req.body.drillScore;
    var battleScore = req.body.battleScore;

    console.log('import questions');

    var temp_path = req.files.file.path;
    if (temp_path) {
        fs.readFile(temp_path, 'utf-8', function(err, content) {

            //先保存题集,并返回题集qsid
            var QuestionStore = mongoose.model('QuestionStore');
            var qs = new QuestionStore(req.body);

            var qsid = '';

            var content = JSON.parse(content);
            var Question = mongoose.model('Question');

            qs.save(function (err, questionStore, numberAffected) {
                if(err) throw err;
                qsid = questionStore.get('_id').toString();

                //题目保存
                for(var i= 0,len=content.length;i<len;i++){
                    content[i]['qsid'] = qsid;
                    /*var question = new Question(content[i]);
                    (function(i){
                        question.save(function (err, question, numberAffected) {
                            if(err) throw err;
                            content[i]['_id'] = question.get('_id').toString();
                            delete content[i]['answer'];
                        });
                    })(i);*/
                }
                Question.create(content, function () {
                    var params = arguments;
                    if(params[0]){
                        throw params[0];
                    }
                    for(var i= 0,len=content.length;i<len;i++){
                        content[i]['_id'] = params[i+1].get('_id').toString();
                         delete content[i]['answer'];
                    }
                    //根据题集生成文件夹
                    var qDir = questionStoreDir + qsid;
                    fileutil.mkdirs(qDir, 0755, function(){
                        //生成试卷
                        for(var k=0;k<createPaperNum;k++){
                            var qNo = [];
                            // 循环N次生成随机数
                            for(var i = 0 ; ; i++){
                                //生成随机数个数
                                if(qNo.length< paperQuestionNum){
                                    generateRandom(content.length);
                                }else{
                                    break;
                                }
                            }

                            // 生成随机数的方法
                            function generateRandom(count){
                                var rand = parseInt(Math.random()*count);
                                for(var i = 0 ; i < qNo.length; i++){
                                    if(qNo[i] == rand){
                                        return false;
                                    }
                                }
                                qNo.push(rand);
                            }

                            var arr = [];
                            for(var i= 0,len=content.length;i<len;i++){
                                if(qNo.indexOf(i) > -1){
                                    var a = content[i];
                                    arr.push(JSON.stringify(a));
                                }
                            }
                            var str = '[' + arr.join(',') + ']';
                            var fn = qDir + '\\' + k + '.json';
                            fs.writeFile(fn, str, function (e) {
                                if(e) throw e;
                            });
                        }
                    });
                });
            });
            // 删除临时文件
            fs.unlink(temp_path);
        });
    }
    res.redirect('/admin#/importquestions');
});

//系统报表
router.get('/report', function(req, res){
    console.log('report index');
    res.render('report');
});

//用户登录日志表
router.get('/report/logs', function(req, res){
    Log.find().exec(function(err, logs){
        var pf = os.platform().toString();
        var filepath =  __dirname + (pf == 'win32' ? '\\' : '/')
            + (new Date()).getTime() + Math.random() + '.csv';

        var str = 'SID,用户,操作,时间\n';
        for(var i = 0, len = logs.length; i < len; i++){
            var l = logs[i];
            str += l.sid + ',' + l.name + ',' + l.action + ',' + moment(l.time).format(formater) + '\n';
        }
        fs.writeFile(filepath, str, {encoding:'UTF-8'}, function(){
            fileutil.download(req, res, filepath, '日志.csv', function(err){
                if(err){
                    throw err;
                }
                fs.unlink(filepath);
            });
        });
    });
});

//挑战记录
router.get('/report/battles', function(req, res){

    Battle.find().exec(function(err, battles){
        var pf = os.platform().toString();
        var filepath =  __dirname + (pf == 'win32' ? '\\' : '/')
            + (new Date()).getTime() + Math.random() + '.csv';

        //挑战状态：N - 未开始 F - 已经完成 I - 正在进行中 E-跑路(所有人跑路)
        var str = 'SID,用户,题目集,状态,开始时间,结束时间,练习积分,挑战积分\n';
        for(var i = 0, len = battles.length; i < len; i++){
            var b = battles[i];
            var s = b.status;
            str += b.sid + ',' + b.sname + ',' + b.qstitle
                + ',' + (s == 'N' ? '未开始' : s == 'F' ? '已完成' : s == 'I' ? '正在进行' : s == E ? '所有人跑路' : '')
                + ',' + moment(b.start).format(formater)
                + ',' + moment(b.end).format(formater)
                + ',' + (b.drillScore || '')
                + ',' + (b.battleScore || '')
                + '\n';
        }
        fs.writeFile(filepath, str, {encoding:'UTF-8'}, function(){
            fileutil.download(req, res, filepath, '挑战记录.csv', function(err){
                if(err){
                    throw err;
                }
                fs.unlink(filepath);
            });
        });
    });
});

//题集导出
router.get('/report/storebattles', function(req, res){

    StoreBattle.find().exec(function(err, battles){
        var pf = os.platform().toString();
        var filepath =  __dirname + (pf == 'win32' ? '\\' : '/')
            + (new Date()).getTime() + Math.random() + '.csv';

        var str = '题目集,用户,练习最高积分,挑战最高积分,挑战时间\n';
        for(var i = 0, len = battles.length; i < len; i++){
            var b = battles[i];
            str += b.qtitle + ',' + b.name
                + ',' + (b.maxBattleScore || '')
                + ',' + (b.maxDrillScore || '')
                + ',' + moment(b.lastTime).format(formater)
                + '\n';
        }
        fs.writeFile(filepath, str, {encoding:'UTF-8'}, function(){
            fileutil.download(req, res, filepath, '挑战挑战记录.csv', function(err){
                if(err){
                    throw err;
                }
                fs.unlink(filepath);
            });
        });
    });
});

module.exports = router;
