var moment = require('moment');
module.exports = function (router, passport)
{
    var Messages = require('../models/schemes/message');
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
    router.get('/ng', function (req, res, next)
    {
        res.sendFile('../client-app/dist/index.html');
    });
    /* GET home page. */
    router.get('/index', function (req, res, next)
    {
        res.redirect('/');
    });

    router.get('/', function (req, res, next)
    {
        if (req.user)
        {
            if (req.user.role == 'client') {
                res.render('pages/index', {title: 'Altor - Home', user: req.user, messege: "", moment: moment , isNewApp : "false"});
            }
            else if (req.user.role == 'manager') {
                res.render('pages/manage-business', {title: 'Altor - Home', user: req.user, messege: "", moment: moment , isNewApp : "false"});
            }
        }
        else
        {
            res.render('pages/index', {title: 'Altor - Home', user: req.user, messege: "", moment: moment, isNewApp : "false"});
        }
    });
};

