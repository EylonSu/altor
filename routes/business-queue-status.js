var Network = require('../models/network');
var Branch = require('../models/branch');
var Service = require('../models/schemes/service');
var shift = require('../models/schemes/shift');
var workDay = require('../models/schemes/workday');
var moment = require('moment');

module.exports = function (router, passport)
{
	router.get('/business-queue-status', function (req, res, next)
	{
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        messege: "Unable to show business queue status! please try again later..."
                    });
                }
                res.render('pages/business-queue-status', { title: 'Altor', user: req.user, workdays: network.branches[0].workdays, moment: moment});
            });
	});
};