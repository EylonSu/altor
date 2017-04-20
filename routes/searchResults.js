var similarity = require("similarity")
var network = require('../models/network');
var branch = require('../models/branch');

module.exports = function (router)
{
    router.get('/searchResults', function (req, res, next) {
        var query = req.query.srchItem;
		network.find({}, { name: true }, function (err, networks)
        {
            var searchResults = [];

            for(var i = 0; i < networks.length ; i++ ){
				var network_name = networks[i].name;
				var network_id = networks[i]._id.toString();
				var howMuchSimilar = similarity(query, network_name);
				if (howMuchSimilar > 0.17)
				{
					searchResults.push({ network_name, network_id });
                }
            }
            searchResults.sort(function (a,b)
            {
                return a.howMuchSimilar < b.howMuchSimilar;
            })

            res.render('pages/searchResults', {title: 'תוצאות חיפוש עבור:' + query, user: req.user , serachResults : searchResults});
        })

    });
};

