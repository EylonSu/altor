var mongoose = require('mongoose');

var branchSchema = mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		managers: [{ type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true }],
		email: { type: String, required: true, trim: true },
		phone: { type: String },
		picture_path: { type: String },
		address: {
			country: String,
			city: String,
			street: String,
			number: Number
		},
		employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		workdays: [require('../models/schemes/workday')],
		messages: [require('../models/schemes/message')],
		services: [require('../models/schemes/service')],
		default_shifts: [require('../models/schemes/shift')]
	});

Array.prototype.inArray = function (comparer)
{
	for (var i = 0; i < this.length; i++)
	{
		if (comparer(this[i])) return true;
	}
	return false;
};
Array.prototype.pushIfNotExist = function (element, comparer)
{
	if (!this.inArray(comparer))
	{
		this.push(element);
	}
};

branchSchema.methods.FindClientsByShift = function (iWorkdayId, iShiftId)
{
	var workday = this.FindWorkdayById(iWorkdayId);
	var shiftHours = workday.GetShiftById(iShiftId).hours;
	var appintmnts = workday.GetAppintmntsByHours(shiftHours);
	var clients = [];
	appintmnts.forEach(function (iApp)
	{
		clients.pushIfNotExist(iApp.client, function (client)
		{
			return iApp.client._id == client._id
		});
	});

	return clients;
};

branchSchema.methods.FindWorkdayById = function (iWorkdayId)
{
	var res;

	this.workdays.forEach(function (iWd)
	{
		if (iWd._id == iWorkdayId)
		{
			res = iWd;
			return;
		}
	});

	return res;
}

branchSchema.methods.findWorkday = function (date)
{
	var res;
	var d = new Date(date.getTime());
	d.setHours(0, 0, 0, 0);
	this.workdays.forEach(function (workday)
	{
		workday.date.setHours(0, 0, 0, 0);

		if (workday.date.valueOf() == d.valueOf())
		{
			res = workday;
		}
	});

	return res;
};

branchSchema.methods.setWorkDay = function (date, workD)
{
	var res;
	var d = new Date(date.getTime());
	d.setHours(0, 0, 0, 0);

	for (var i = 0; i < this.workdays.length; i++)
	{
		var tempWorkday = this.workdays[i];
		tempWorkday.date.setHours(0, 0, 0, 0);

		if (tempWorkday.date.valueOf() == d.valueOf())
		{
			this.workdays[i] = workD;
			this.save(function (err, branch)
			{
				if (err)
				{
					console.log(err)
				}
				else
				{
					var b = branch;
				}
			})
			break;
		}
	};

	return res;
};

branchSchema.methods.GetServiceById = function (serviceId)
{
	var res;
	this.services.forEach(function (service)
	{
		if (service._id.toString() == serviceId)
		{
			res = service;
		}
	})

	return res;
}

branchSchema.methods.AddAppintmnt = function (date, appintmnt)
{
	var sDate = new Date(date.toString());

	var fullService = this.GetServiceById(appintmnt.service);

	var fullappintment = {
		client: appintmnt.client,
		start_time: appintmnt.start_time,
		service: fullService
	};

	var workday = this.findWorkday(date);
	if (workday)
	{
		workday = workday.AddAppintmnt(fullappintment);
		return this;
	}
	else
		return "no such workday";
};

branchSchema.methods.delAppointment = function (appToDel)
{
	var workday = this.findWorkday(new Date(appToDel.date_and_time));
	if (workday)
	{
		workday = workday.delAppintmnt(appToDel);
		return this;
	}
	else
		return "no such workday";
}

branchSchema.methods.GetOpenSpots = function (iServiceId, iMonth)
{
	var res = [];
	var service = this.GetServiceById(iServiceId);
	var i = 0;

	this.workdays.forEach(function (iWorkday)
	{
		if (iWorkday.date.getFullYear() == iMonth.getFullYear() && iWorkday.date.getMonth() == iMonth.getMonth())
		{
			var temp = [];

			iWorkday.shifts.forEach(function (iShift)
			{
				var shiftOpenSpots = iShift.shift.GetOpenSpots(service);
				if (shiftOpenSpots.length > 0)
				{
					temp.push(shiftOpenSpots);
				}
			});
			if (temp.length > 0)
			{
				var prototype = {};

				prototype.date = iWorkday.date;
				prototype.openSpots = temp;

				res[i] = prototype;
				i++;
			}
		}
	});

	return res;
};

module.exports = mongoose.model('Branch', branchSchema);