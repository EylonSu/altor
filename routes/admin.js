module.exports = function (router, passport)
{
	var User = require('../models/user');
	var Messages = require('../models/schemes/message');

	router.get('/del-user', function (req, res)
	{
		var email = req.query.email; // $_GET["id"]
		User.findOne({ 'email': email }, function (err, user)
		{
			if (err)
			{
				res.redirect('/error');
			}

			if (user.email == email)
			{
				user.remove();
			}
		});
		res.redirect('/admin');
	});

	router.get('/del-message', function (req, res)
	{
		var id = req.query.id;
		Messages.findOne({ '_id': id }, function (err, message)
		{
			if (err)
			{
				res.redirect('/error');
			}

			if (message._id == id)
			{
				message.remove();
			}
		});
		res.redirect('/admin');
	});

	router.post('/send-message', function (req, res)
	{
		var email = req.query.email;
		var content = req.body.content;
		User.findOne({ 'email': email }, function (err, user)
		{
			if (err)
			{
				res.redirect('/error');
			}

			if (user.email == email)
			{
				var msg = new Messages();
				msg.from = req.user.email;
				msg.to = email;
				msg.read = false;
				msg.content = content;

				msg.save(function (err)
				{
					if (err)
						res.redirect('/error');

					res.redirect('/admin');
				});
			}
		});
	});

	router.get('/admin', isAdmin, function (req, res)
	{
		User.find({}, function (err, users)
		{
			res.render('pages/admin', { title: 'Altor', user: req.user, eUser: users });
		});
	});

	function isAdmin(req, res, next)
	{
		if (req.user)
		{
			if (req.user.email === "admin")
				next();
			return;
		}
		res.redirect('/');
	}
};
