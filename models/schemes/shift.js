var mongoose = require('mongoose');
var moment = require('moment');

"use strict";

var shiftSchema = mongoose.Schema(
	{
		title: String,
		stations: [{
			title: String,
			services: [{ type: [mongoose.Schema.ObjectId], ref: "service", required: true }],
			numOfServiceProviders: Number,
			availbleArrs: [[String]]
		}]
	});

shiftSchema.methods.SetAvailbleArrs = function (appintmnt)
{
	var startIndex = getIndexFromDate(appintmnt.start_time);
	//var durationIn5Packets = appintmnt.service.duration / 5;
	var stationIndexes = getRelevantStation(startIndex, appintmnt.service._id);

	for (var i = startIndex; i < durationIn5Packets; i++)
	{
		if (this.stations[stationIndex[0]].availbleArrs[stationIndex[1]][startIndex] != "A")
		{
			throw "error";
		}
		else
		{
			this.stations[stationIndex[0]].availbleArrs[stationIndex[1]][startIndex] = "B";
		}
	}
};

shiftSchema.methods.getRelevantStation = function (startIndex, iServiceId)
{
	var res;
	var found;
	var index = 0;

	this.stations.forEach(function (iStation)
	{
		if (iStation.services.includes(iServiceId))
		{
			var durationIn5Packets = 
			iStation.availbleArrs.forEach(function (iAvalArr)
			{
				found = true;
				for (var i = startIndex; i < durationIn5Packets; i++)
				{
					if (iAvalArr[i] != "A")
					{
						found = false;
						return;
					}
				}
			});

			if (found)
			{
				res = index;
				return;
			}
		}

		index++;
	});

	return res;
}
function getIndexFromDate(iStartTimeStr)
{
	var hourInt = iStartTimeStr.getHours();
	hourInt = hourInt * (60 / 5);

	var minInt = iStartTimeStr.getMinutes();
	minInt = minInt / 5;

	var sum = hourInt + minInt;

	return sum;
}

shiftSchema.methods.GetOpenSpots = function (service)
{
	var res = [];
	this.stations.forEach(function (station)
	{
		var duration = service.duration;
		var isRelevant = false;
		station.services.forEach(function (_service)
		{
			if (_service.toString() == service._id.toString())
				isRelevant = true;
		});

		if (isRelevant)
		{
			station.availbleArrs.forEach(function (avlArr)
			{
				//avlArr.forEach(function (avlStr) //5 min interval str
				for (var i = 0; i < avlArr.length; i++)
				{
					var found = true;
					if (avlArr[i] == "A")
					{
						for (var j = i + 1; j < i + (duration / 5); j++)
						{
							if (avlArr[j] != "A")
							{
								i = j;
								found = false;
								break;
							}
						}
						if (found == true)
						{
							res.push(getTimeFromIndex(i));
						}
					}
				}
			})
		}
	});

	res = uniq(res);
	return res;
};

function uniq(a)
{
	var uniqueArray = a
		.map(function (date)
		{
			return date.getTime()
		})
		.filter(function (date, i, array)
		{
			return array.indexOf(date) === i;
		})
		.map(function (time)
		{
			return new Date(time);
		});

	return uniqueArray;
}

function getTimeFromIndex(index)
{
	var startTime = new Date().setHours(0, 0, 0, 0);
	var res = moment(startTime).add(index * 5, 'm').toDate();
	return res;
}

module.exports = shiftSchema;