module.exports = function (router, passport)
{
	router.get('/getSMS', function (req, res, next)
	{
		var a = {};
		a.phone = "0525953639";
		a.message = "helllo mannn";
		res.json(a);
	});
};