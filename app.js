//check master
/// external modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');

var router = express.Router();
var passport = require('passport');
var flash = require('connect-flash');

/// ====================configuration==========================
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
require('./config/passport')(passport); // pass passport for configuration
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database

/// ====================our pages==========================
var index = require('./routes/index')(router, passport);
var users = require('./routes/users')(router);
var clientSignUp = require('./routes/client-sign-up')(router, passport);
var businessSignUp = require('./routes/business-sign-up')(router, passport);
var login = require('./routes/login')(router, passport);
var admin = require('./routes/admin')(router, passport);
var fakeNet =require('./routes/fakeNetwork')(router);
var fakeBranch = require('./routes/fakeBranch')(router);
var network =require ('./routes/network')(router);
var searchResults = require('./routes/searchResults')(router);
/// ====================other routing==========================
var routes = require('./routes/routes')(router);

var app = express();

///  ====================view engine setup==========================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
engine = require('ejs-mate');
// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public/assets', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(router);

// catch 404 and forward to error handler
app.use(function (req, res, next)
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next)
{
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('pages/error', {user: req.user});
});

module.exports = app;