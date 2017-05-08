const path = require('path');

module.exports = function (router)
{
	router.get('/api', function (req, res, next)
	{
        var p=path.join(__dirname, '../appointment/dist/index.html');
		res.sendFile(p);
	});
};