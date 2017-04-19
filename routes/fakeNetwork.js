/**
 * Created by MaorDavidzon on 4/17/2017.
 */
var network = require('../models/network');
module.exports = function (router ) {
    /* GET signup page. */
    router.get('/fakeNetwork', function (req, res, next) {

        var newNetwork = new network();
        newNetwork.name = 'shoni';
        newNetwork.email = 'roni@walla.com';

        newNetwork.categories.push("פן");
        newNetwork.categories.push("גבות");
        newNetwork.address.city = 'beit dagan';
        newNetwork.address.country = 'beit dagan';
        newNetwork.address.street = 'trompeldor';
        newNetwork.address.number =4;

        newNetwork.managers.push("58cd79c1e7730001b0b8faf3");
        newNetwork.managers.push("58e6336c7e58b72c149f2078");
        newNetwork.branches.push("58f4c4f76d161f2f34d3d114");
        newNetwork.branches.push("58f7649f1d4bcb3ae4247d71");


        newNetwork.save(function (err)
        {
            if (err)
                return done(err);

            //return done(null, newNetwork);
        });
        res.render('pages/index', {title: 'Altor - Home', user: req.user});    });



};