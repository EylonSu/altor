﻿var mongoose = require('mongoose');

var branchSchema = mongoose.Schema(
    {
        //branch: ObjectId //TODO altor+
        name: { type: String, required: true, trim: true },
        managers: [{ type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true }],
        email: { type: String, required: true, trim: true },
        phone: { type: String },
        picture_path: { type: String },
        address:
        {
            country: String,
            city: String,
            street: String,
            number: Number
        },
        //queues: [require('../models/queue')], //TODO altor+
        employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        workdays: [require('../models/schemes/workday')],
        messages: [require('../models/schemes/message')],
        services: [require('../models/schemes/service')],
		default_shifts: [require('../models/schemes/shift')]

	 });

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

branchSchema.methods.GetDurationbyServiceId = function (serviceId)
{
	this.services.forEach(function (service)
	{
		if (service._id.toString() == serviceId)
		{
			return service.duration;
		}
	})
}

branchSchema.methods.AddAppintmnt = function (date, appintmnt)
{
	var workday = this.findWorkday(date);
	if (workday)
		workday.AddAppintmnt(appintmnt);
	else
		return "no such workday";

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
};

module.exports = mongoose.model('Branch', branchSchema);