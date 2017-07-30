var SmsModel = require('../models/sms');

module.exports = function (router)
{
	router.get('/logout', function (req, res)
	{
		req.logout();
		res.redirect('/');
	});

	router.get('/sms', function (req, res)
	{
		res.render('pages/sms', { user: null });
	});

	router.post('/sendSMS', function (req, res, next)
	{
		var example = new SmsModel();
		example.target = req.body.target;
		example.message = req.body.message;
		example.save(function (err)
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
}