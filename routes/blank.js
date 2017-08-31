module.exports = function (router, passport)
{
	router.get('/seetings', function (req, res, next)
	{
		res.render('pages/index', {
			title: 'Altor | Error!',
			user: req.user,
			messege: "אירעה תקלה במערכת. אנא נסה שנית"
		});
	});
};