/**
 * Created by dell on 01/05/2017.
 */
module.exports = function (router) {
    var addService = function (req, res, next) {
        // 1. Make sure the service doesn't exist
        var network = Network.findOne{ req.user.network;
        var serviceName = req.body.serviceName;
        console.log(serviceName);

        // 2. Add to the database
    };
    router.post('/add-service', addService(req, res, next));
};