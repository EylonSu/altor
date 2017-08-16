module.exports = function (router, passport)
{
	router.get('/send-message', function (req, res, next)
	{
		var a = {};
		a.phone = "0525953639";
		a.message = "helllo mannn";
		res.json(a);
	});
};