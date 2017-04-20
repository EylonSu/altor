module.exports = function (router, passport)
{
	var Messages = require('../models/schemes/message');

	/* GET home page. */
	router.get('/index', function (req, res, next)
	{
		res.redirect('/');
	});

	router.get('/', function (req, res, next)
	{
		if (req.user)
		{
			res.render('pages/index', { title: 'Altor - Home', user: req.user , messege:""});
		}
		else
		{
			res.render('pages/index', { title: 'Altor - Home', user: req.user , messege:"" });
		}
	});
};

