var Network = require('../models/network');
var Branch = require('../models/branch');
var Service = require('../models/schemes/service');
var shift = require('../models/schemes/shift');
var workDay = require('../models/schemes/workday');
var moment = require('moment');
var MAX_UPCOMING_APPOINTMENTS_ARR_LEN = 3;
function sortWorkdays(workdays) {
    return workdays.sort(function (a, b) {
        return a.date < b.date;
    })
}
module.exports = function (router, passport)
{
    var today = moment(new Date());

    function hasAppointmentsToday(workdays) {
        return getTodaysAppointments(workdays).length > 0;
    }

    function getTodaysAppointments(workdays) {
        var todaysAppointments = [];
        for (var i = 0; i < workdays.length; i++) {
            var workdayDateAsMoment = moment(workdays[i].date);
            if (workdayDateAsMoment.isSame(today, 'd') && workdays[i].appointments.length > 0) {
                todaysAppointments = workdays[i].appointments;
                break;
            }
        }
        todaysAppointments = todaysAppointments.sort(function (a, b) {
            return a.date_and_time < b.date_and_time;
        }).reverse();
        return todaysAppointments;
    }

    function getCurrentAppointments(workdays) {
        var now = moment();
        var todaysAppointments = getTodaysAppointments(workdays);
        var currentAppointments = [];

        for (var i = 0; i < todaysAppointments.length; i++) {
            var currAppointmentStartTime = moment(todaysAppointments[i].date_and_time);
            var currAppointmentEndTime = moment(currAppointmentStartTime).add(todaysAppointments[i].service.duration, 'minutes');
            if (now.isBetween(currAppointmentStartTime, currAppointmentEndTime)) {
                var currAppointment = {
                    customerName: todaysAppointments[i].client.first_name + ' ' + todaysAppointments[i].client.last_name[0] + '.',
                    startTime: currAppointmentStartTime.format('HH:mm'),
                    endTime: currAppointmentEndTime.format('HH:mm')
                };
                currentAppointments.push(currAppointment);
            }
        }
        return currentAppointments;
    }

    function getUpcomingAppointments(workdays) {
        var now = moment();
        var todaysAppointments = getTodaysAppointments(workdays);
        var upcomingAppointments = [];

        for (var i = 0; i < todaysAppointments.length && upcomingAppointments.length < MAX_UPCOMING_APPOINTMENTS_ARR_LEN; i++) {
            var currAppointmentStartTime = moment(todaysAppointments[i].date_and_time);
            var currAppointmentEndTime = moment(currAppointmentStartTime).add(todaysAppointments[i].service.duration, 'minutes');
            if (currAppointmentStartTime.isAfter(now)) {
                var upcomingAppointment = {
                    customerName: todaysAppointments[i].client.first_name + ' ' + todaysAppointments[i].client.last_name[0] + '.',
                    startTime: currAppointmentStartTime.format('HH:mm'),
                    endTime: currAppointmentEndTime.format('HH:mm')
                };
                upcomingAppointments.push(upcomingAppointment);
            }
        }
        return upcomingAppointments;
    }

	router.get('/business-queue-status', function (req, res, next)
	{
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate({
                path: 'branches',
                populate: {
                    path: 'workdays.appointments.client'
                }
            })
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        messege: "Unable to show business queue status! please try again later..."
                    });
                }
                var sortedWorkdays = sortWorkdays(network.branches[0].workdays);
                res.render('pages/business-queue-status', { title: 'Altor', user: req.user, currentAppointments: getCurrentAppointments(sortedWorkdays), upcomingAppointments:getUpcomingAppointments(sortedWorkdays), moment: moment, branch: network.branches[0]});
            });
	});
};