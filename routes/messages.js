module.exports = function (router)
{
	router.get('/messages', function (req, res, next)
	{
		res.render('pages/messages', {
			user: req.user,
			title: 'Incoming Messages',
			messages:
			[
				'first',
				'second'			
			]
		});
	});
};