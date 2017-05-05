module.exports = function (router, passport) {
    /* GET signup page. */
    router.get('/business-sign-up', function (req, res, next) {
        res.render('pages/business-sign-up', { title: 'Altor', user: req.user, message: req.flash('signupMessage') });
    });

    // process the signup form
    router.post('/business-sign-up', passport.authenticate('manager-signup', {
        successRedirect: '/add-branch', // redirect to the secure profile section
        failureRedirect: '/business-sign-up', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};