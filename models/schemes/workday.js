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
			start_time: Date,
			service: { type: require('./service') },
			station_title: String
		}]
	});

workDaySchema.methods.AddAppintmnt = function (appintmnt)
{
	//TODO validation
	this.appointments.push(appintmnt);
	var relevantShift = this.getShiftByTime(appintmnt.start_time);
	relevantShift.SetAvailbleArrs(appintmnt);
};

workDaySchema.methods.getShiftByTime = function(iStart_time)
{
	var res;

	iStart_time.setFullYear(1970);
	iStart_time.setMonth(0);
	iStart_time.setDate(1);
	iStart_time = iStart_time.getTime();

	this.shifts.forEach(function (iShift)
	{
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
			res = iShift.shift;
			return;
		}
	});

	return res;
};

module.exports = workDaySchema;