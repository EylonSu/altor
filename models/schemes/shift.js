var mongoose = require('mongoose');
var moment = require('moment');
var _ = require('underscore-node');
"use strict";

var shiftSchema = mongoose.Schema(
    {
        title: String,
        stations: [{
            title: String,
            services: [{type: [mongoose.Schema.ObjectId], ref: "service", required: true}],
            numOfServiceProviders: Number,
            availbleArrs: [[String]]
        }]
    });

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
                for (var i=0;i<avlArr.length;i++)
                {
                    var found=true;
                    if (avlArr[i] == "A")
                    {
                        for (var j = i+1; j < i + (duration/5); j++)
                        {
                            if (avlArr[j] != "A")
                            {
                                i = j;
                                found=false;
                                break;
                            }
                        }
                        if (found==true)
                        {
                            res.push(getTimeFromIndex(i));
                        }
                    }
                }
            })
        }
	});

    res =uniq(res);
	return res;
};

function uniq(a) {
    var uniqueArray = a
        .map(function (date) {
            return date.getTime()
        })
        .filter(function (date, i, array)
        {
            return array.indexOf(date) === i;
        })
        .map(function (time) {
            return new Date(time);
        });

   return uniqueArray;
}

function getTimeFromIndex(index)
{
    var startTime = new Date().setHours(0,0,0,0);
	var res = moment(startTime).add(index * 5, 'm').toDate();
	return res;
}

module.exports = shiftSchema;