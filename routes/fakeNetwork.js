var network = require('../models/network');
var branch = require('../models/branch');
var manager = require('../models/manager');
var user = require('../models/user');

module.exports = function (router)
{
	router.get('/fakeNetwork', function (req, res, next)
	{
		var mngr = createManager();
		var branchId = createBranch(mngr._id);

		var newNetwork = new network();
		newNetwork.name = 'שופרסל';
		newNetwork.email = 'supersal@walla.com';

		newNetwork.categories.push("סופרים");
		newNetwork.address.city = 'בית שמש';
		newNetwork.address.country = 'ישראל';
		newNetwork.address.street = 'הלה';
		newNetwork.address.number = 1;

		newNetwork.managers.push(mngr._id);
		newNetwork.branches.push(branchId);

		mngr.networks.push(newNetwork._id);
		mngr.branches.push(branchId);

		newNetwork.save(function (err)
		{
			if (err)
				console.log(err);
		});

		user.findOne({ 'email': mngr.email }, function (err, mngr)
		{
			if (err)
			{
				console.log(err);
			}
		});

		res.redirect('/');
	});

	var service = {
		name: "פן",
		duration: 15, // in minutes
		note: "נא לא לעשות רולים לפני"
	}

	function createBranch(mngr)
	{
		var newBranch = new branch();
		var empsId = createEmployee(newBranch.id);

		newBranch.name = 'הסופר של תקווה';
		newBranch.managers.push(mngr);
		newBranch.email = 'tikva@walla.com';
		newBranch.categories.push("סופרים");
		newBranch.phone = "05252525252";

		newBranch.address.city = 'בית דגן';
		newBranch.address.country = 'ישראל';
		newBranch.address.street = 'החבצלת';
		newBranch.address.number = 1;

		newBranch.employees.push(empsId);

		var shift =
			{
				duration: 120, //in minutes
				working_employees: empsId
			};
		newBranch.shifts.push(shift);
		newBranch.services.push(service);

		newBranch.save(function (err)
		{
			if (err)
				return err;
		});

		return newBranch._id;
	}

	function createManager()
	{
		var manager = new manager();

		manager.full_name = "shimon hagever";
		manager.first_name = "shimon";
		manager.last_name = "hagever";
		manager.email = "shimon@gmail.com";
		manager.password = manager.generateHash("12345");
		manager.phone = "05258888888";
		manager.join_date = new Date();

		manager.save(function (err) { console.log(err) });

		return manager;
	}

	function createEmployee(branchId)
	{
		var emp = new employee();

		emp.full_name = "shmulik Sudai";
		emp.first_name = "shmulik";
		emp.last_name = "Sudai";
		emp.email = "shmulik@gmail.com";
		emp.password = emp.generateHash("12345");
		emp.phone = "052599999999";
		emp.join_date = new Date();
		emp.services.push(service);
		emp.branches.push(branchId);

		emp.days = (
			[{
				is_working_today: true,
				date: new Date(),
				active_hours: [{
					start_time: new Date("01 / 06 / 2017, 07:00"),
					end_time: new Date("01/06/2017, 15:00")
				}],
				availability_str: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
				appointments:
				[{
					client: "58f871b50655ef182c9684f8",
					start_time: new Date("1/6/2017, 08:00"),
					service: service
				}]
			}]);

		emp.save(function (err) { console.log(err) });

		return emp._id;
	}
};