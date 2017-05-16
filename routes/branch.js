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
				var adr = branch.address.street + " " + branch.address.number + " " + branch.address.city + " " + branch.address.country;
				res.render('pages/branch', { user: req.user, branch: branch ,address :adr });
			}
	)});

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

	function getScheduledEvents(branch, serviceId)
	{
		var result = [];
		var workdays = branch.workdays;

		workdays.forEach(function (workday)
		{
			workday.appointments.forEach(function (appointment)
			{
				var serviceDuration = appointment.service.duration;

				var event = {};
				event.backgroundColor = '#ff0000'; //red
				event.start = moment(appointment.start_time);
				event.end = event.start.add(serviceDuration, 'minutes');

				result.push(event);
			})
		})

		return result;
	}
};