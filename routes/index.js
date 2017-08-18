var moment = require('moment');

module.exports = function (router, passport)
{
    var Messages = require('../models/schemes/message');

    router.get('/ng', function (req, res, next)
    {
        res.sendFile('../client-app/dist/index.html');
    });
    /* GET home page. */
    router.get('/index', function (req, res, next)
    {
        res.redirect('/');
    });

    router.get('/', function (req, res, next)
    {
        if (req.user)
        {
            res.render('pages/index', {title: 'Altor - Home', user: req.user, messege: "", moment: moment , isNewApp : "false"});
        }
        else
        {
            res.render('pages/index', {title: 'Altor - Home', user: req.user, messege: "", moment: moment, isNewApp : "false"});
        }
    });
};

