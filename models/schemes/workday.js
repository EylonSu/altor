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
};

module.exports = workDaySchema;