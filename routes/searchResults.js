var similarity = require("similarity")
var network = require('../models/network');
var branch = require('../models/branch');
var moment = require('moment');

module.exports = function (router)
{
	router.get('/searchResults', function (req, res, next)
	{
		var query = req.query.srchItem;
		branch.find({}, { name: true }, function (err, networks)
		{
			if (err)
			{
				res.render('pages/index', { title: 'Altor - Home', user: req.user, messege: "Error occurred, please try again later....", moment: moment, isNewApp : "false" });
			}

            var searchResults = [];


			for (var i = 0; i < networks.length; i++)
			{
				var network_name = networks[i].name;
				var network_id = networks[i]._id.toString();
				var howMuchSimilar = similarity(query, network_name);
				if (howMuchSimilar > 0.15)
				{
					searchResults.push({ network_name, network_id });
				}
			}

			if (searchResults.length == 0)
			{
				res.render('pages/index', { title: 'Altor - Home', user: req.user,moment: moment, messege: "There are no relevant results for: " + query , isNewApp : "false"});
			}else
            {
                searchResults.sort(function (a, b)
                {
                    return a.howMuchSimilar < b.howMuchSimilar;
                });

                res.render('pages/searchResults', {
                    title: 'Search results for "' + query + '"',
                    user: req.user,
                    serachResults: searchResults
                });
            }})
	});
};

