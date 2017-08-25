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


branchSchema.methods.getOfferedAppForReplace = function (serviceId, date)
{
    var workday = this.findWorkday(new Date (date));
    return workday.getOfferedAppForReplace(serviceId);
}



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

branchSchema.methods.offerAppForReplacment = function (offeredApp, clientId)
{
    var workday = this.findWorkday(new Date(offeredApp.date_and_time));
    if (workday)
    {
        workday = workday.offerAppForReplacment(offeredApp, clientId);
        return this;
    }
    else
        return "no such workday";
}

branchSchema.methods.updateApps =function (newApp, oldApp)
{
    var workday1 = this.findWorkday(new Date(newApp.date_and_time));
    var workday2 = this.findWorkday(new Date(newApp.date_and_time));

    //update first app
    for(var i =0 ; i< workday1.appointments.length; i++){
        if ((new Date(workday1.appointments[i].date_and_time).getTime() == new Date(newApp.date_and_time).getTime())
            &&(workday1.appointments[i].service._id.toString() == newApp.service._id.toString())
            &&(workday1.appointments[i].client.toString() == newApp.client.toString()))
        {
            workday1.appointments[i].client = oldApp.client;
            workday1.appointments[i].offeredForReplacment = false;
            break;
        }
    }

    //update second app
    for(var i =0 ; i< workday2.appointments.length; i++){
        if ((new Date(workday2.appointments[i].date_and_time).getTime() == new Date(oldApp.date_and_time).getTime())
            && (workday2.appointments[i].service._id.toString() == oldApp.service._id.toString())
            &&(workday2.appointments[i].client.toString() == oldApp.client.toString()))
        {
            workday2.appointments[i].client = newApp.client;
            workday2.appointments[i].offeredForReplacment = false;
        }
    }

    return this;
}

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