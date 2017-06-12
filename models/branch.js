﻿﻿var mongoose = require('mongoose');

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

branchSchema.methods.setWorkDay = function (date,workD)
{
    var res;
    var d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);

    for(var i = 0; i< this.workdays.length; i++)
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

    var fullappintment ={
        client: appintmnt.client,
        start_time: appintmnt.start_time,
        service: fullService
    };

    var workday = this.findWorkday(date);
    if (workday)
	{
		workday = workday.AddAppintmnt(fullappintment);
		return this;
		//var xbranch = this;
		//this.update(function (err)
		//{
		//	if (err)
		//	{
		//		console.log("error in saving branch");
		//	}
		//	else
		//	{
		//		//console.log('branch saved with the title: ' + xbranch.workdays[0].shifts[0].shift.stations[0].title);
		//	}
		//});
    }
    else
        return "no such workday";
};

branchSchema.methods.GetOpenSpots = function(iServiceId, iMonth)
{
    var res = [];
    var service = this.GetServiceById(iServiceId);
    var i=0;

    this.workdays.forEach(function (iWorkday)
    {
        if(iWorkday.date.getFullYear() == iMonth.getFullYear() && iWorkday.date.getMonth() == iMonth.getMonth())
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
            if(temp.length > 0)
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