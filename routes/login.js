module.exports = function (router, passport) {

    /* GET signup page. */
    router.get('/login', function (req, res, next) {
        res.render('pages/login', { title: 'Altor', user: req.user, message: req.flash('loginMessage')});
    });

    router.get('/loginSuccess', function(req,res){
        if (req.user.email == "admin")
            res.redirect('/admin');
        else
            res.redirect('/index');
    });

    // process the signup form
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/loginSuccess', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};