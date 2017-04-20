var similarity = require("similarity")
var network = require('../models/network');
var branch = require('../models/branch');

module.exports = function (router)
{
    router.get('/searchResults', function (req, res, next) {
        var query = req.query.srchItem;
		network.find({}, { name: true }, function (err, networks)
        {
            if(err){
                res.render('pages/index', { title: 'Altor - Home', user: req.user , messege : "אירעה תקלה. אנא חפש שנית" });
            }
            var searchResults = [];


            for(var i = 0; i < networks.length ; i++ ){
				var network_name = networks[i].name;
				var network_id = networks[i]._id.toString();
				var howMuchSimilar = similarity(query, network_name);
				if (howMuchSimilar > 0.25)
				{
					searchResults.push({ network_name, network_id });
                }
            }

            if(searchResults.length == 0){
                res.render('pages/index', { title: 'Altor - Home', user: req.user , messege : "There is no relevant results to: "  +query });
            }
            searchResults.sort(function (a,b)
            {
                return a.howMuchSimilar < b.howMuchSimilar;
            })

            res.render('pages/searchResults', {title: 'תוצאות חיפוש עבור:' + query, user: req.user , serachResults : searchResults});
        })

    });
};

