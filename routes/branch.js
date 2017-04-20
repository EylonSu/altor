var Branch = require('../models/branch.js');

module.exports = function (router, passport)
{
	router.get('/branch', function (req, res, next)
	{
		var branchId = req.query.branch;

		Branch.findOne({ _id: branchId })
			.populate('managers', 'employees')
			.exec(function (err, branch)
			{
				res.render('pages/branch', { user: req.user, branch: branch });
			}
	)});
};