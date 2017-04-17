/**
 * Created by MaorDavidzon on 4/17/2017.
 */
var network = require('../models/network');
module.exports = function (router ) {
    /* GET signup page. */
    router.get('/network', function (req, res, next) {


        res.render('pages/network', {title: 'Wellcome to' + req.Search, user: req.user});    });

    router.post('/network', function(req, res, next){
        network.findOne({'name': req.body.srchItem}, function (err, netWork)
        {
            if (err)
            {
                res.redirect('/error');
            }
            res.render('pages/network', {title: 'Wellcome to ' + netWork.name + ' bussines page!', user: req.user, network: netWork});
        });
    });

};