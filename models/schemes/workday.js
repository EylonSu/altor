var mongoose = require('mongoose');

var workDaySchema = mongoose.Schema(
	{
		date: Date,
		shifts: [{
			shift: require('./shift'),
			hours: {
				startTime: String,
				endTime: String
			}
		}],
		appointments: [{
			client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
            date_and_time: Date,
			date_as_string: String,
			service: require('./service'),
			station_title: String
		}]
	});

workDaySchema.methods.AddAppintmnt = function (appintmnt)
{
	//TODO validation
	var relevantShiftIndex = this.getShiftIndexByTime(appintmnt.start_time);
	var res = this.shifts[relevantShiftIndex].shift.SetAvailbleArrs(appintmnt);
	this.shifts[relevantShiftIndex].shift = res.shift;
	appintmnt.station_title = res.stationTitle;//.stationTitle;
	this.appointments.push(appintmnt);

	return this;
	//var xwd = this;
	//this.save(function (err)
	//{
	//	if (err)
	//	{
	//		console.log("error in saving workday");
	//	}
	//	else
	//	{
	//		//console.log('workday saved with the title: ' + xwd.shifts[0].shift.stations[0].title);
	//	}
	//});
};

workDaySchema.methods.getShiftIndexByTime = function(iStart_time)
{
	var res = 0;

	iStart_time.setFullYear(1970);
	iStart_time.setMonth(0);
	iStart_time.setDate(1);
	iStart_time = iStart_time.getTime();
	
	for (var i = 0; i < this.shifts.length; i++)
	{
		var iShift = this.shifts[i];
		var startStr = iShift.hours.startTime.split(":");
		var ishiftStart = new Date(0);
		ishiftStart.setHours(parseInt(startStr[0]));
		ishiftStart.setMinutes(parseInt(startStr[1]));
		ishiftStart = ishiftStart.getTime();

		var endStr = iShift.hours.endTime.split(':');
		var ishiftEnd = new Date(0);
		ishiftEnd.setHours(parseInt(endStr[0]));
		ishiftEnd.setMinutes(parseInt(endStr[1]));
		ishiftEnd = ishiftEnd.getTime();

		if (iStart_time >= ishiftStart && iStart_time <= ishiftEnd)
		{
			res = i;
			break;
		}
	}

	return res;
};

module.exports = workDaySchema;