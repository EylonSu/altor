var LocalStrategy = require('passport-local').Strategy;
var PassportUtils = require('./passport-utils');

var User = require('../models/user');
var Manager = require('../models/manager');
var Client = require('../models/client');
var Network = require('../models/network');
var Branch = require('../models/branch');

function createBranchFromNetwork(network, manager) {
    var createdBranch = new Branch();
    createdBranch.name = network.name;
    createdBranch.email = manager.email;
    createdBranch.managers = network.managers;
    createdBranch.address.country = network.address.country;
    createdBranch.address.city = network.address.city;
    createdBranch.address.street = network.address.street;
    createdBranch.address.number = network.address.number;
    createdBranch.picture_path = network.picture_path;

    return createdBranch;
}
module.exports = function (passport)
{
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done)
    {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done)
    {
        User.findById(id, function (err, user)
        {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL AUTHENTICATION =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done)
        {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function ()
            {
                User.findOne({'email': email}, function (err, user)
                {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else
                        return done(null, user);
                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUPS =============================================================
    // =========================================================================
    passport.use('manager-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done)
        {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function ()
            {
                if (PassportUtils.ValidateEmail(email) == false)
                {
                    return done(null, false, req.flash('signupMessage', 'the email is not valid.'));
                }
                var error = {errorDes: ''};
                if (!PassportUtils.validatePassword(password, error))
                {
                    return done(null, false, req.flash('signupMessage', error.errorDes));
                }
                if (!req.user)
                {
                    User.findOne({'email': email}, function (err, user)
                    {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that email
                        if (user)
                        {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        }
                        else
                        {
                            // create the manager
                            var newManager = new Manager();
                            newManager.role = 'manager';
                            newManager.email = email;
                            newManager.first_name = req.body.firstName;
                            newManager.last_name = req.body.lastName;
                            newManager.password = newManager.generateHash(password);
                            newManager.joinDate = new Date();
                            newManager.phone = req.body.phone;
                            // Create the network
							var network = new Network();
							network.email = email;
                            network.name = req.body.name;
                            network.categories.push(req.body.category);
                            network.address.country = req.body.country;
                            network.address.city = req.body.city;
                            network.address.street = req.body.street;
                            network.address.number = req.body.streetNumber;
                            var branch = createBranchFromNetwork(network, newManager);
                            branch.save();
                            network.branches.push(branch.id);
							network.save(function (err) { if (err) console.log(err); else console.log("network " + network.name + " was saved"); });
                            newManager.networks_own.push(network.id);
                            newManager.save(function (err) {
                                if (err)
                                    return done(err);

                                network.managers.push(newManager.id);
                                console.log(newManager.first_name + " was saved");
                                return done(null, newManager);
                            });
                        }
                    });
                    // if the user is logged in but has no local account...
                } else
                {
                    // user is logged in and already has a local account. Ignore sign-up. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }
            });
        }));

    passport.use('client-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done)
        {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function ()
            {
                if (PassportUtils.ValidateEmail(email) == false)
                {
                    return done(null, false, req.flash('signupMessage', 'the email is not valid.'));
                }
                var error = {errorDes: ''};
                if (!PassportUtils.validatePassword(password, error))
                {
                    return done(null, false, req.flash('signupMessage', error.errorDes));
                }
                if (!req.user)
                {
                    User.findOne({'email': email}, function (err, user)
                    {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that email
                        if (user)
                        {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        }
                        else
                        {
                            // create the user
                            var newClient = new Client();
                            newClient.email = email;
                            newClient.password = newClient.generateHash(password);
                            var fullName = req.body.firstName + " " + req.body.last_name;
                            newClient.full_name = fullName;
                            newClient.first_name = req.body.first_name;
                            newClient.last_name = req.body.last_name;

                            newClient.role = 'client';
                            newClient.phone = req.body.phone_number;
                            newClient.joinDate = new Date();

                            newClient.save(function (err)
                            {
                                if (err)
                                    return done(err);

                                return done(null, newClient);
                            });
                        }
                    });
                    // if the user is logged in but has no local account...
                } else
                {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }
            });
        }));
};