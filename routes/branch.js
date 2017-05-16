var Branch = require('../models/branch.js');
var moment = require('moment');

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
			}
			)
	});

	router.post('/set-appintmnt', function (req, res)
	{
		var date = new Date(req.body.chosenDate)
		var appintmnt = {
			client: req.user._id,
			start_time: date,
			service: req.body.serviceId
		}

		Branch.findById(req.body.branchId, function (err, branch)
		{
			var err = branch.AddAppintmnt(date, appintmnt);
			if (err)
				console.log(err);
		});
	});

	router.get('/get-branch-events', function (req, res)
	{
		var branchId = req.query.branch;
		var serviceId = req.query.serviceId;

		Branch.findById(branchId, function (err, branch)
		{
			var events = getScheduledEvents(branch, serviceId);
			res.json(events);
		})
	});

	function getScheduledEvents(branch, serviceId, date)
	{
		var result=[];
		var workday;
		branch.workdays.forEach(function (_workday)
		{
			var wdd = new Date(_workday.date.getTime()).setHours(0, 0, 0, 0);
			if (_workday.date.setHours(0, 0, 0, 0) == wdd)
			{
				workday = _workday;
			}
		})

		workday.shifts.forEach(function (shift)
		{
			var service = branch.GetServiceById(serviceId);
			result.push(shift.shift.GetOpenSpots(service));
		})
		//event.backgroundColor = '#ff0000'; //red
		//event.start = moment(appointment.start_time);
		//event.end = event.start.add(serviceDuration, 'minutes');

		//result.push(event);


		return result;
	}
};