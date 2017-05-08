var Network = require('../models/network');
var Branch = require('../models/branch');
var Service = require('../models/schemes/service');
var shift = require('../models/schemes/shift');

module.exports = function (router, passport)
{
	router.get('/add-branch', function (req, res, next)
	{
        res.render('pages/add-branch', { title: 'Altor', user: req.user, message: req.flash('signupMessage') });
	});

    router.post('/add-branch', [function (req, res, next)
    {
        if (req.user.networks_own.length <= 0) {
            // TODO: Send message that you can't add branches if you don't own a network
        }
        else if (req.user.networks_own.length > 1) {
            // TODO: Ask user to choose on which network to add the branch
        }
        // Owns exactly 1 network
        else {
            Network.findOne({'_id' : req.user.networks_own[0] }, function(err, network){
                console.log(network);//TODO restrict access to this page unless signed in
                if (err) {
                    console.log(err);
                }
                else {
                    var newBranch = new Branch();
                    newBranch.name = req.body.branchName;
                    newBranch.email = req.body.email;
                    newBranch.phone = req.body.phone;
                    newBranch.services.push({ name: "Men Haircut", duration: 30, note: "Avihai was here"});
                    newBranch.services.push({ name: "Women Haircut", duration: 60, note: "Nir was here"});
                    newBranch.save();
                    network.branches.push(newBranch.id);
                    network.save(function (err)
                    {
                        if (err)
                            return done(err);

                        return next();
                    });
                }
            })
        }
        }, function(req, res) {
        res.redirect('/manage-shifts');
    }]);

    router.get('/manage-shifts', function (req, res, next)
    {
        Network.findOne({ '_id': req.user.networks_own[0] })
            .populate('branches')
            .exec(function (err, network)
            {
                if(err){
                    res.render('pages/index', { title: 'Altor - Home', user: req.user , messege : "אירעה תקלה במערכת. אנא נסה שנית" });
                }
                res.render('pages/manage-shifts', { user: req.user, shifts: network.branches[0].default_shifts});
            });
    });

    router.get('/add-shift', function (req, res, next)
    {
        Network.findOne({ '_id': req.user.networks_own[0] })
            .populate('branches')
            .exec(function (err, network)
            {
                if(err){
                    res.render('pages/index', { title: 'Altor - Home', user: req.user , messege : "אירעה תקלה במערכת. אנא נסה שנית" });
                }
                res.render('pages/add-shift', { user: req.user, services: network.branches[0].services});
            });
    });

    router.post('/add-shift', function (req, res, next)
    {
        Network.findOne({ '_id': req.user.networks_own[0] })
            .populate('branches')
            .exec(function (err, network)
            {
                if(err){
                    res.render('pages/index', { title: 'Altor - Home', user: req.user , messege : "אירעה תקלה במערכת. אנא נסה שנית" });
                }
                console.log(req.body);
                var newShift = {
                    title : req.body.shiftTitle,
                    stations: [],
                    hours: {
                        start_time: req.body.shiftHoursFrom,
                        end_time: req.body.shiftHoursUntil
                    }
                };
                var types = req.body.types;
                for (var i=0;i<types;i++) {
                    var shiftStation = {
                        services: [],
                        numOfServiceProviders: req.body["[" + i + "].typeRepeats"]
                    };
                    var services = req.body["["+i+"].serviceName"];
                    if (services.constructor === Array) {
                        var len = services.length;
                        for (var j=0;j<len;j++) {
                            shiftStation.services.push(services[j]);
                            }
                        }
                    else {
                        shiftStation.services.push(services);
                    }
                    console.log(req.body["["+i+"].serviceName"]);
                    newShift.stations.push(shiftStation);
                }
                network.branches[0].default_shifts.push(newShift);
                network.branches[0].save();
                res.render('pages/add-shift', { user: req.user, services: network.branches[0].services});
            });
    });
};