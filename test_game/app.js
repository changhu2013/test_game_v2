var config = require('./config');
var mongoose = require('mongoose');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var routes = require('./routes/index');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//日志记录
var log = require('./log');
var logger = log.logger;
log.use(app);

//var logger = require('morgan');
//app.use(logger('dev'));

//设置将会话信息存数Mongo数据库
app.use(session({
    secret : config.cookieSecret,
    resave:true,
    saveUninitialized:true,
    cookie: {
        maxAge: config.sessionMaxAge
    },
    unset : 'destroy', //完事儿删除,默认为keep，即保留
    store : new MongoStore({
        host : config.host,
        db : config.db,
        username : config.user,
        password : config.pwd
    })
}));

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(flash());

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//通用变量
app.use(function(req, res, next){
    res.locals.appName = 'test game';
    res.locals.success = req.flash('success');
    res.locals.user = req.session?req.session.user:null;
    next();
});

app.use('/', routes);

//mongoose
var url = 'mongodb://' + config.host + '/' + config.db;
mongoose.connect(url, {
    user : config.user,
    pass : config.pwd
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
