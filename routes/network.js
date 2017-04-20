
var network = require('../models/network');
var branch = require('../models/branch');
module.exports = function (router)
{
	/* GET signup page. */
	router.get('/network', function (req, res, next)
	{
		network.findOne({ '_id': req.query.net })
			.populate('branches')
			.exec(function (err, network)
			{
				res.render('pages/network', { user: req.user, network: network});
			});
	});
};

