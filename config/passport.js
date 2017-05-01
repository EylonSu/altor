var LocalStrategy = require('passport-local').Strategy;
var PassportUtils = require('./passport-utils');

var User = require('../models/user');
var Business = require('../models/business');
var Client = require('../models/client');
var Network = require('../models/network');

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
				User.findOne({ 'email': email }, function (err, user)
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
	passport.use('business-signup', new LocalStrategy({
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
                var error = { errorDes: '' };
                if (!PassportUtils.validatePassword(password, error))
                {
                    return done(null, false, req.flash('signupMessage', error.errorDes));
                }
                if (!req.user)
                {
                    User.findOne({ 'email': email }, function (err, user)
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
							// create the business
							var newBusiness = new Business();
							newBusiness.role = 'business';
							newBusiness.email = email;
							newBusiness.password = newBusiness.generateHash(password);
							newBusiness.joinDate = new Date();
							// Create the network
							var network = new Network();
							network.name = req.body.name;
                            network.categories.push(req.body.category);
                            network.address.country = req.body.country;
                            network.address.city = req.body.city;
                            network.address.street = req.body.street;
                            network.save();
                            newBusiness.network = network.id;
                            console.log(newBusiness.business);
							newBusiness.save(function (err)
							{
								if (err)
									return done(err);

								return done(null, newBusiness);
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
				var error = { errorDes: '' };
				if (!PassportUtils.validatePassword(password, error))
				{
					return done(null, false, req.flash('signupMessage', error.errorDes));
				}
				if (!req.user)
				{
					User.findOne({ 'email': email }, function (err, user)
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