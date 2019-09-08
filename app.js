var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require(path.join(__dirname, '/config.json'));
var debug = require('debug')('app:server');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var boardsRouter = require('./routes/board');

var app = express();

server = require('http').createServer(app),
    io = require('socket.io').listen(server),


io.on('connection', function (socket) {
    io.sockets.emit('this', { will: 'be received by everyone'});

    socket.on('this', function (from, msg) {
        debug('I received a private message by '+ from+ ' saying '+ msg);
    });

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });

    socket.on('error',function (err) {
        console.log(err)
    });
});

app.set("io", io);

app.use(function(req, res, next) {
    req.io = io;
    next();
});

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//allow cross origin
app.use(require('cors')());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/boards', boardsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


if (config.appMode == 'local') {
    var socket = require('socket.io-client')("http://localhost:3000");
    socket.on('connect', function(){});
    socket.on('event', function(data){
        console.log('socket ',data)
    });
    socket.on('disconnect', function(){});
}else {
    var socket = require('socket.io-client')(config.baseUrl);
    socket.on('connect', function(){});
    socket.on('event', function(data){
        debug('socket ',data)
    });
    socket.on('disconnect', function(){});
}

server.listen(3000,function () {
    console.log('listening port 3000')
});

module.exports = app;
