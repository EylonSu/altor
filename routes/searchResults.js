/**
 * Created by MaorDavidzon on 4/17/2017.
 */
var similarity = require("similarity")
var network = require('../models/network');
var branch = require('../models/branch');
module.exports = function (router ) {
    /* GET signup page. */
    router.get('/searchResults', function (req, res, next) {
        var query = req.query.srchItem;
        network.find({}, function (err, networks)
        {
            var strSimilarArr = [];
            var temp = networks;
            for(var i = 0; i < networks.length ; i++ ){
                var tempStr =networks[i].name;
                var tempSim = similarity(query,tempStr);
                if(tempSim > 0.17){
                    strSimilarArr.push({tempStr, tempSim});
                }
            }
            strSimilarArr.sort(function (a,b)
            {
                return a.tempSim < b.tempSim;
            })

            res.render('pages/searchResults', {title: 'תוצאות חיפוש עבור:' + query, user: req.user , serachResults : strSimilarArr});
        })

    });

    router.post('/network', function(req, res, next){
        network.findOne({'name': req.body.srchItem})
               .populate('branches')
               .exec(function (err, f_network)
               {
                   var nir = f_network.branches[1].name;
               });




        network.findOne({'name': req.body.srchItem}, function (err, f_network)
        {
            branch.find({'_id' : '58f4c4f76d161f2f34d3d114'}, function (err, data){
                data
            });
            //var temp2 = temp.then();
            if (err)
            {
                res.redirect('/error');
            }

            res.render('pages/network', {title: 'Wellcome to ' + f_network.name + ' bussines page!', user: req.user, network: f_network});
        });
    });

};

