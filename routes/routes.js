var SmsModel = require('../models/sms');
var User = require('../models/user');

module.exports = function (router)
{
	router.get('/logout', function (req, res)
	{
		req.logout();
        req.session.destroy(function (err) {
            res.redirect('/'); //Inside a callback… bulletproof!
        });
	});

	router.get('/sms', function (req, res)
	{
		res.render('pages/sms', { user: null });
	});

	router.post('/sendSMS', function (req, res, next)
	{
		var Sms = new SmsModel();
		Sms.target = req.body.target;
		Sms.message = req.body.message;
		Sms.save(function (err)
		{
			if (err)
			{
				console.log(err);
			}
		});

		res.send('Messeage sent successfully to ' + req.body.target);
	});

	router.get('/getSMS', function (req, res, next)
	{
		SmsModel.find({ has_sent: false }, { target: true, message: true, }, function (err, smss)
		{
			if (err)
				res.send(err);
			if (smss)
			{
				smss.forEach(function (doc)
				{
					doc.has_sent = true;
					doc.save(function (err)
					{
						if (err)
						{
							console.log(err);
						}
					});
				});

				res.json(smss);
			}
		});
	});

	router.post('/deleteAltorMessage', function (req, res)
	{
		User.findById(req.user._id, function (err, iUser)
		{
			if (err)
			{
				console.log(err);
			}
			else
			{
				iUser.messages.forEach(function (iMessage)
				{
					if (iMessage._id == req.body.message_id)
					{
						iMessage.has_read = true;
						return;
					}
				});

				iUser.save();
			}
		});

		res.end();
	});
}