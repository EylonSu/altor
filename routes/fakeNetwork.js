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

		mngr.networks_own.push(newNetwork._id);
		mngr.branches_own.push(branchId);

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

	function createBranch(mngr)
	{
		var newBranch = new branch();
		//var empsId = createEmployee(newBranch.id);

		newBranch.name = 'הסופר של תקווה';
		newBranch.managers.push(mngr);
		newBranch.email = 'tikva@walla.com';
		newBranch.phone = "05252525252";

		newBranch.address.city = 'בית דגן';
		newBranch.address.country = 'ישראל';
		newBranch.address.street = 'החבצלת';
		newBranch.address.number = 1;
        newBranch.services.push(
            {
                name: "תספורת נשים",
                duration: 15,
                note:
                    "נא לעשות חפיפה לפני"
            },
            {
                name: "תספורת גברים",
                duration: 30,
                note: "נא לנקות את כל הכינים לפני התור"
            });
        var service0_id=newBranch.services[0]._id;
        var service1_id=newBranch.services[1]._id;

        newBranch.default_shifts.push({
            title: "משמרת ברירת מחדל",
            services: {
                service:[service0_id, service1_id],
                numOfServiceProviders: 2,
                hours: {
                    start_time: "08:00",
                    end_time: "18:00"
                }
            }
        });

        var now = new Date();
        newBranch.workdays.push({
            date: now,
            shifts: newBranch.default_shifts[0]
        });

		newBranch.save(function (err)
		{
			if (err)
				return err;
		});

		return newBranch._id;
	}

	function createManager()
	{
		var mana = new manager();
        mana.role = 'manager';
		mana.first_name = "shimon";
		mana.last_name = "hagever";
		mana.email = "shimon@gmail.com";
		mana.password = mana.generateHash("12345");
		mana.phone = "05258888888";
		mana.join_date = new Date();

		mana.save(function (err) { if(err) console.log(err) });

		return mana;
	}
};