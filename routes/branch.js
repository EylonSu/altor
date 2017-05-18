var Branch = require('../models/branch.js');
var moment = require('moment');
var _ = require('underscore-node');
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
		//var month = req.query.month;
		var month = new Date();

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

// 	function getScheduledEvents(branch, serviceId, month) // month = date
// 	{
//         var  unionArrResult = [[]];
// 		var result=[[]];
// 		// var workday;
// 		// branch.workdays.forEach(function (_workday)
// 		// {
// 		// 	var wdd = new Date(_workday.date.getTime()).setHours(0, 0, 0, 0);
// 		// 	if (_workday.date.setHours(0, 0, 0, 0) == wdd)
// 		// 	{
// 		// 		workday = _workday;
// 		// 	}
// 		// })
//         ///  openSpots =  {1: {date: 1/5/17,
// 								//openSpots: {10:00,10:05...}
// 		//						}
// 		/// 				...}
// 		var openSpots = branch.GetOpenSpots(serviceId, month); ///month=Date
//
//
//
//         branch.workdays.forEach(function (_workday){
//         _workday.shifts.forEach(function (shift)
// 		{
// 			var service = branch.GetServiceById(serviceId);
// 			result.push(shift.shift.GetOpenSpots(service));
//
// 			});
//             unionArrResult.push(_.union(result));
//         });
// 		//event.backgroundColor = '#ff0000'; //red
// 		//event.start = moment(appointment.start_time);
// 		//event.end = event.start.add(serviceDuration, 'minutes');
//
// 		//result.push(event);
//
//
//
// 		return unionArrResult;
// 	}
// };