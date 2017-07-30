﻿var mongoose = require('mongoose');
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
	var durationIn5Packets = appintmnt.service.duration / 5;
	var relevantStationsIndex = this.getRelevantStation(startIndex, appintmnt.service);
	var foundedAvalbleArr;

	var isArrUpdate = false;
	for (var i = 0; i < relevantStationsIndex.length; i++)
	{

		if (isArrUpdate)
			break;

		var index = 0;
		this.stations[relevantStationsIndex[i]].availbleArrs.forEach(function (availbleArr)
		{
			if (isArrUpdate)
				return;

			for (var j = startIndex; j < startIndex + durationIn5Packets; j++)
			{
				if (availbleArr[j] != "A")
				{
					index++;
					return;
				}
				else
				{
					availbleArr[j] = "B";
				}
			}
			foundedAvalbleArr = availbleArr;
			isArrUpdate = true;
		})
		if (isArrUpdate)
		{
			this.stations[relevantStationsIndex[i]].availbleArrs[index] = foundedAvalbleArr;
			this.stations[relevantStationsIndex[i]].title = "check";
			var res = {};
			res.shift = this;
			res.stationTitle = this.stations[relevantStationsIndex[i]].title;;

			var xshift = this;
			//this.save(function (err)
			//{
			//	if (err)
			//	{
			//		console.log("error in saving shift");
			//	}
			//	else
			//	{
			//		//console.log('shift saved with the title: ' + xshift.stations[0].title);
			//	}
			//});

			return res;
		}
	}

	if (!isArrUpdate)// here the error is thrown
	{
		res.send('booooozzzzzz');
	}
};

shiftSchema.methods.getRelevantStation = function (startIndex, iServiceId)
{
	var res = [];
	var found;
	var index = 0;
	for (index = 0; index < this.stations.length; index++)
	{
		var isServiceInclude = false;
		for (var j = 0; j < this.stations[index].services.length; j++)
		{
			if (this.stations[index].services[j].toString() == iServiceId._id.toString())
			{
				isServiceInclude = true;
				break;
			}
		}

		if (isServiceInclude)
		{
			var isStationAvailable = false;
			var durationIn5Packets = iServiceId.duration / 5;

			this.stations[index].availbleArrs.forEach(function (iAvalArr)
			{
				if (!isStationAvailable)
				{
					found = true;
					for (var i = startIndex; i < startIndex + durationIn5Packets; i++)
					{
						if (iAvalArr[i] != "A")
						{
							found = false;
							return;
						}
					}
					if (found)
					{
						res.push(index);
						isStationAvailable = true;
					}
				}
			});
		}
	};

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