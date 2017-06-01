var Branch = require('../models/branch.js');
var moment = require('moment');
//var _ = require('underscore-node');
module.exports = function (router, passport)
{
	router.get('/branch', function (req, res, next)
	{
		var branchId = req.query.branch;

		Branch.findOne({ _id: branchId })
			.populate('managers', 'employees')
			.exec(function (err, branch)
			{
				//TODO check if branch exists
				var adr = branch.address.street + " " + branch.address.number + " " + branch.address.city + " " + branch.address.country;
				res.render('pages/branch', { user: req.user, branch: branch, address: adr });
			});
	});

	router.post('/set-appintmnt', function (req, res)
	{
		var date = new Date(req.body.chosenDate);
		var appintmnt = {
			client: req.user._id,
			start_time: date,
			service: req.body.serviceId
		};

		Branch.findById(req.body.branchId, function (err, branch)
		{
			var _err = branch.AddAppintmnt(date, appintmnt);
			if (_err)
				console.log(_err);
		});
	});

	router.get('/get-branch-events', function (req, res)
	{
		var branchId = req.query.branch;
		var serviceId = req.query.serviceId;
		var month = new Date(parseInt(req.query.month));

		Branch.findById(branchId, function (err, branch)
		{
			var events = getScheduledEvents(branch, serviceId, month);
			res.send(events); //don't forget to reset the timezone to jerusalem...
		})
	});


    function getScheduledEvents(branch, serviceId, month) // month = date
    {
        var openSpots = branch.GetOpenSpots(serviceId, month); ///month=Date
		return openSpots;
    }
};