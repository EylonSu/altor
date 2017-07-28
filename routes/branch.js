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
			});
	});

	router.post('/set-appintmnt', function (req, res)
	{
		var date = new Date(req.body.dateTime);

		var selectedTime = req.body.Time;
		var h_m_Arr = selectedTime.split(':');

		date.setHours(h_m_Arr[0],h_m_Arr[1]);
		//for debug TODO remove
		var id;
		if (req.user)
		{
			id = req.user._id;
		}
		else
		{
			id = "591b51d294c9e040348244ec";
		}

		var appintmnt = {
			client: id,
			start_time: date,
			service: req.body.serviceId
		};

		Branch.findById(req.body.branchId, function (err, branch)
		{
			var newBranch = branch.AddAppintmnt(date, appintmnt);
			if (newBranch)
			{
				branch = newBranch;
				branch.markModified('workdays');
				branch.save(function (err, updatedDoc)
				{
					if (err)
					{
						console.log(err);
					}
				});
			}
		});

		//res.send('yeahhhh');
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