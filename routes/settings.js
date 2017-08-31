var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (router)
{
	router.get('/settings', function (req, res, next)
	{
		res.render('pages/settings', {
			title: 'Uset settings',
			user: req.user,
		});
	});

	router.post('/settings', function (req, res, next)
	{
		var first = req.body.first_name;
		var last = req.body.last_name;
		var email = req.body.email;
		var phone = req.body.phone_number;

		User.findOne(req.user, function (err, iUser)
		{
			if (err)
			{
				console.log(err);
			}
			else
			{
				iUser.first_name = first;
				iUser.last_name = last;
				iUser.phone = phone;
				iUser.email = email;
				if (req.body.password)
					iUser.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);

				iUser.save();
			}
		});

		res.redirect('/settings');
	});
};