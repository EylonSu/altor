var Network = require('../models/network');
var Branch = require('../models/branch');
var Service = require('../models/schemes/service');

module.exports = function (router, passport)
{
	router.get('/add-branch', function (req, res, next)
	{
        res.render('pages/add-branch', { title: 'Altor', user: req.user, message: req.flash('signupMessage') });
	});

    router.post('/add-branch', [function (req, res, next)
    {
        Network.findOne({'_id' : req.user.network }, function(err, network){
            console.log(network);
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
    }, function(req, res) {
        res.redirect('/manage-shifts');
    }]);

    router.get('/manage-shifts', function (req, res, next)
    {
        Network.findOne({ '_id': req.user.network })
            .populate('branches')
            .exec(function (err, network)
            {
                if(err){
                    res.render('pages/index', { title: 'Altor - Home', user: req.user , messege : "אירעה תקלה במערכת. אנא נסה שנית" });
                }
                res.render('pages/manage-shifts', { user: req.user, services: network.branches[0].services});
            });
    });
};