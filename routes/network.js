/**
 * Created by MaorDavidzon on 4/17/2017.
 */
var network = require('../models/network');
var branch = require('../models/branch');
module.exports = function (router ) {
    /* GET signup page. */
    router.get('/network', function (req, res, next) {
        network.findOne({'name': req.query.net})
               .populate('branches')
               .exec(function (err, f_network)
               {
                   res.render('pages/network', {title: 'Wellcome to ' + f_network.name + ' Network page!', user: req.user, network: f_network , branches : f_network.branches});

               });
   });


    router.post('/network', function(req, res, next){
        network.findOne({'name': req.body.srchItem})
                           .populate('branches')
                           .exec(function (err, f_network)
                           {
                               var nir = f_network.branches[1].name;
                           });

            res.render('pages/network', {title: 'Wellcome to ' + f_network.name + ' bussines page!', user: req.user, network: f_network});

    });

};

