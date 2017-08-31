var Network = require('../models/network');
var Branch = require('../models/branch');
var Service = require('../models/schemes/service');
var shift = require('../models/schemes/shift');
var workDay = require('../models/schemes/workday');
var moment = require('moment');

module.exports = function (router, passport) {
    router.get('/manage-business', function (req, res, next) {
        if (req.user.role != 'manager') {
            res.render('pages/index', {
                title: 'Altor - Error!',
                message: req.flash("You are not logged in as a manager!")
            });
        }
        else {
            res.render('pages/manage-business', {title: 'Altor | Manage business', user: req.user})
        }
    });

    router.get('/manage-services', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        message: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                res.render('pages/manage-services', {
                    title: 'Altor | Manage services',
                    user: req.user,
                    services: network.branches[0].services,
                    wizardMode: req.session.wizardMode
                });
            });
    });

    router.post('/add-service', [function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                // Add service form validation
                req.checkBody('serviceName').notEmpty();
                req.sanitizeBody('serviceName').escape();
                req.checkBody('serviceLength', 'Service length must be 5-240').isInt().gte(5).lte(240);

                //Run the validators
                var errors = req.validationErrors();

                //Create a genre object with escaped and trimmed data.
                var newService = {
                    name: req.body.serviceName,
                    duration: req.body.serviceLength,
                    notes: req.body.serviceNotes
                };

                if (errors) {
                    //If there are errors render the form again, passing the previously entered values and errors
                    res.render('pages/manage-services', {
                        title: 'Altor',
                        user: req.user,
                        services: network.branches[0].services,
                        errors: errors
                    });
                }
                else {
                    // Form is valid, make sure the service name is unique
                    var services = network.branches[0].services;
                    for (var i = 0; i < services.length; i++) {
                        if (newService.name == services[i].name) {
                            res.redirect('/manage-services');
                            return;
                        }
                    }
                    // New services name is unique
                    network.branches[0].services.push(newService);
                    network.branches[0].save(function (err) {
                        if (err)
                            return done(err);

                        return next();
                    })
                }
            })
    }, function (req, res, next) {
        res.redirect('/manage-services');
    }]);

    router.get('/add-branch', function (req, res, next) {
        res.render('pages/add-branch', {title: 'Altor', user: req.user, message: req.flash('signupMessage')});
    });

    router.post('/add-branch', [function (req, res, next) {
        if (req.user.networks_own.length <= 0) {
            // TODO: Send message that you can't add branches if you don't own a network
        }
        else if (req.user.networks_own.length > 1) {
            // TODO: Ask user to choose on which network to add the branch
        }
        // Owns exactly 1 network
        else {
            var networkId = req.user.networks_own[0].toString();
            Network.findOne({'_id': networkId}, function (err, network) {
                console.log(network);//TODO restrict access to this page unless signed in
                if (err) {
                    console.log(err);
                    return;
                }
                if (network) {
                    var newBranch = new Branch();
                    newBranch.name = req.body.branchName;
                    newBranch.email = req.body.email;
                    newBranch.phone = req.body.phone;
                    newBranch.save();
                    network.branches.push(newBranch.id);
                    network.save(function (err) {
                        if (err)
                            return done(err);

                        return next();
                    });
                }
                else {
                    console.log("No network was found");
                }
            })
        }
    }, function (req, res) {
        res.redirect('/manage-business');
    }]);

    router.get('/manage-shifts', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor - Home',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                res.render('pages/manage-shifts', {user: req.user, shifts: network.branches[0].default_shifts, wizardMode: req.session.wizardMode});
            });
    });

    router.get('/add-shift', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor - Home',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                res.render('pages/add-shift', {user: req.user, services: network.branches[0].services});
            });
    });

    router.post('/add-shift', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor - Home',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                console.log(req.body);
                var newShift = {
                    title: req.body.shiftTitle,
                    stations: []
                };
                var types = req.body.types;
                for (var i = 0; i < types; i++) {
                    var shiftStation = {
                        services: [],
                        numOfServiceProviders: req.body["[" + i + "].typeRepeats"],
                        availbleArrs: []
                    };
                    // Init the availableArrs - enter an array for each provider with all hours taken
                    // We make them available on shift assignment
                    for (var k = 0; k < shiftStation.numOfServiceProviders; k++) {
                        var singleProviderArr = [];
                        for (var l = 0; l < 60 * 24 / 5; l++) {
                            singleProviderArr.push("B");
                        }
                        shiftStation.availbleArrs.push(singleProviderArr);
                    }
                    //TODO fix this crap
                    var services = req.body["[" + i + "].serviceName"];
                    if (services.constructor === Array) {
                        var len = services.length;
                        for (var j = 0; j < len; j++) {
                            shiftStation.services.push(services[j]);
                        }
                    }
                    else {
                        shiftStation.services.push(services);
                    }
                    console.log(req.body["[" + i + "].serviceName"]);
                    newShift.stations.push(shiftStation);
                }
                network.branches[0].default_shifts.push(newShift);
                network.branches[0].save();
                res.redirect('/manage-shifts');
            });
    });

    router.get('/assign-shifts', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                res.render('pages/assign-shifts', {user: req.user, shifts: network.branches[0].default_shifts, wizardMode: req.session.wizardMode});
            });
    });

    var updateAvailabalityArrs = function (shiftToAdd, inputShiftHours) {
        for (var i = 0; i < shiftToAdd.stations.length; i++) {
            var currStation = shiftToAdd.stations[i];
            for (var j = 0; j < currStation.numOfServiceProviders; j++) {
                var startTimeParts = inputShiftHours.startTime.split(':');
                var endTimeParts = inputShiftHours.endTime.split(':');
                var startTime = ((parseInt(startTimeParts[0])*60) + parseInt(startTimeParts[1])) / 5;
                var endTime = ((parseInt(endTimeParts[0])*60) + parseInt(endTimeParts[1])) / 5;
                for (var l = startTime; l<endTime; l++) {
                    currStation.availbleArrs[j][l] = "A";
                }
            }
        }
    };
    router.post('/assign-shift', [
        // Handle the shift assignment request
        function (req, res, next) {
            Network.findOne({'_id': req.user.networks_own[0]})
                .populate('branches')
                .exec(function (err, network) {
                    if (err) {
                        res.render('pages/index', {
                            title: 'Altor | Error!',
                            user: req.user,
                            message: "אירעה תקלה במערכת. אנא נסה שנית"
                        });
                    }
                    var selectedWorkdayDate = new Date(req.body.date);
                    var workDay = findWorkday(network.branches[0].workdays, selectedWorkdayDate);
                    var shouldPushWorkday = false;
                    if (workDay == null) {
                        shouldPushWorkday = true;
                        workDay = {
                            date: selectedWorkdayDate,
                            shifts: []
                        };
                    }
                    // Add the shift
                    var shiftToAdd = getManpowerById(network.branches[0].default_shifts, req.body.templateShift);
                    var inputShiftHours = {
                        startTime: req.body.shiftHoursFrom,
                        endTime: req.body.shiftHoursUntil
                    };
                    updateAvailabalityArrs(shiftToAdd, inputShiftHours);
                    workDay.shifts.push({
                        shift: shiftToAdd,
                        hours: inputShiftHours
                    });

                    if (shouldPushWorkday) {
                        network.branches[0].workdays.push(workDay);
                    }
                    network.branches[0].save(function (err) {
                        if (err) {
                            res.render('pages/index', {
                                title: 'Altor | Error!',
                                user: req.user,
                                messege: "אירעה תקלה במערכת. אנא נסה שנית"
                            });
                        }
                        else {
                            res.render('pages/assign-shifts', {
                                user: req.user,
                                shifts: network.branches[0].default_shifts,
                                wizardMode: req.session.wizardMode
                            });
                        }
                    });
                });
        },
        // Redirect back to the shifts page
        function (req, res, next) {
            Network.findOne({'_id': req.user.networks_own[0]})
                .populate('branches')
                .exec(function (err, network) {
                    if (err) {
                        res.render('pages/index', {
                            title: 'Altor | Error!',
                            user: req.user,
                            messege: "אירעה תקלה במערכת. אנא נסה שנית"
                        });
                    }
                    res.render('pages/assign-shifts', {user: req.user, shifts: network.branches[0].default_shifts, wizardMode: req.session.wizardMode});
                });
        }]);

    function getManpowerById(branchDefaultShiftsArr, selectedManpowerId) {
        for (var i = 0; i < branchDefaultShiftsArr.length; i++) {
            if (branchDefaultShiftsArr[i]._id == selectedManpowerId) {
                return branchDefaultShiftsArr[i];
            }
        }
        return undefined;
    }

    function findWorkday(workdays, selectedWorkdayDate) {
        for (var i = 0; i < workdays.length; i++) {
            if (moment(selectedWorkdayDate).isSame(workdays[i].date, 'year') &&
                moment(selectedWorkdayDate).isSame(workdays[i].date, 'month') &&
                moment(selectedWorkdayDate).isSame(workdays[i].date, 'day')) {
                return workdays[i];
            }
        }

        return null;
    }

    function parseEventFromShift(workday, shift) {
        var currEvent = {title: shift.shift.title};
        var startTime = moment(workday.date);
        var startTimeHours = shift.hours.startTime.split(":");
        currEvent.start = startTime.hours(startTimeHours[0]).minutes(startTimeHours[1]);
        var endTime = moment(workday.date);
        var endTimeHours = shift.hours.endTime.split(":");
        currEvent.end = endTime.hours(endTimeHours[0]).minutes(endTimeHours[1]);
        currEvent.shiftId = shift._id;
        currEvent.workdayId = workday._id;
        return currEvent;
    }

    function getWorkDaysAsEvents(branch) {
        var workdays = branch.workdays;
        var events = [];
        for (var i = 0; i < workdays.length; i++) {
            var currWorkday = workdays[i];
            for (var j = 0; j < currWorkday.shifts.length; j++) {
                events.push(parseEventFromShift(currWorkday, currWorkday.shifts[j]));
            }
        }

        return events;
    }

    router.get('/get-events', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                else {
                    var events = getWorkDaysAsEvents(network.branches[0]);
                    res.json(events);
                }
            });
    });

    router.get('/get-event', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        messege: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
                else {
                    var requestedWorkdayId = req.query.workdayId;
                    var requestedShiftId = req.query.shiftId;
                    var workdays = network.branches[0].workdays;
                    for (var i = 0; i < workdays.length; i++) {
                        if (workdays[i]._id == requestedWorkdayId) {
                            var shifts = workdays[i].shifts;
                            for (var j = 0; j < shifts.length; j++) {
                                if (shifts[j]._id == requestedShiftId) {
                                    res.json(shifts[j]);
                                    return;
                                }
                            }
                        }
                    }

                    res.render('pages/index', {
                        title: 'Altor | Error!',
                        user: req.user,
                        message: "אירעה תקלה במערכת. אנא נסה שנית"
                    });
                }
            });
    });

    function deleteShift(branch, requestedWorkdayId, requestedShiftId) {
        var workdays = branch.workdays;
        for (var i = 0; i < workdays.length; i++) {
            if (workdays[i]._id == requestedWorkdayId) {
                var shifts = workdays[i].shifts;
                for (var j = 0; j < shifts.length; j++) {
                    if (shifts[j]._id == requestedShiftId) {
                        branch.workdays[i].shifts.splice(j, 1);
                        if (workdays[i].shifts.length == 0) {
                            branch.workdays.splice(i, 1);
                        }
                    }
                }
            }
        }
        return branch.workdays;
    }

    router.post('/edit-shift', function (req, res, next) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    done(err);
                }
                else {
                    var shiftId = req.body.shiftId;
                    var workdayId = req.body.workdayId;
                    if (req.body.action == 'delete') {
                        network.branches[0].workdays = deleteShift(network.branches[0], workdayId, shiftId);
                        network.branches[0].save();
					}
					else if (req.body.action =='send-message')
					{
						
					}
                    else {
                        console.log('Shift edit');
                    }
                }
                res.redirect('/assign-shifts');
            });
    });

    function getLoggedInUserBranch(errFunc, callback) {
        Network.findOne({'_id': req.user.networks_own[0]})
            .populate('branches')
            .exec(function (err, network) {
                if (err) {
                    errFunc(err);
                }
                else {
                    callback(network.branches_own[0]);
                }
            });
    }
};