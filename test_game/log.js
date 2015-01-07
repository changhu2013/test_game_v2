
var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'console',
            category: 'console'
        }, //控制台输出
        {
            type: "dateFile",
            filename: 'logs/',
            pattern: "info/yyyyMMddhh.txt", // 占位符，紧跟在filename后面
            alwaysIncludePattern: true, //文件名是否始终包含占位符
            absolute : false, //filename是否绝对路径
            category: 'dateFileLog' //记录器名称
        } //日期文件格式
    ],
    replaceConsole: true,   //替换console.log
    levels:{
        dateFileLog: 'INFO'
    }
});

var dateFileLog = log4js.getLogger('dateFileLog');

exports.logger = dateFileLog;

exports.use = function(app) {
    //页面请求日志,用auto的话,默认级别是WARN
    //app.use(log4js.connectLogger(dateFileLog, {level:'auto', format:':method :url'}));
    app.use(log4js.connectLogger(dateFileLog, {level:'info', format:':method :url'}));
};
