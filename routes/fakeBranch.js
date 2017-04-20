/**
 * Created by MaorDavidzon on 4/17/2017.
 */
var branch = require('../models/branch');
module.exports = function (router ) {
    /* GET signup page. */
    router.get('/fakeBranch', function (req, res, next) {

        var newBranch = new branch();
        newBranch.name = 'Maor place';
        newBranch.email = 'michal@walla.com';
        //newBranch.categories = {'פן','תספורת גברים'};
        newBranch.categories.push("פן");
        newBranch.categories.push("גבות");
        newBranch.address.city = 'בית דגן';
        newBranch.address.country = 'ישראל';
        newBranch.address.street = 'החבצלת';
        newBranch.address.number =1;

        newBranch.managers.push("58cd79c1e7730001b0b8faf3");
        newBranch.managers.push("58e6336c7e58b72c149f2078");
        // newBusiness.role = 'business';
        // newBusiness.email = email;
        // newBusiness.password = newBusiness.generateHash(password);
        // newBusiness.joinDate = new Date();

        newBranch.save(function (err)
        {
            if (err)
                return done(err);

            //return done(null, newBranch);
        });
        res.render('pages/index', {title: 'Altor - Home', user: req.user});    });



};