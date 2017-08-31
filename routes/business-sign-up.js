module.exports = function (router, passport)
{
	/* GET signup page. */
	router.get('/business-sign-up', function (req, res, next)
	{
		res.render('pages/business-sign-up', { title: 'Altor', user: req.user, message: req.flash('signupMessage') });
	});
	var multer = require('multer');
	var fs = require("fs");

	var storage = multer.diskStorage({
		destination: function (req, file, cb)
		{
			cb(null, 'uploads/')
		},
		filename: function (req, file, cb)
		{
			cb(null, file.originalname);
		}
	});

	var upload = multer({
		storage: storage
	});

	router.post('/business-sign-up', upload.any(), function (req, res, next)
	{
		var fileInfo = [];
		for (var i = 0; i < req.files.length; i++)
		{
			fileInfo.push({
				"originalName": req.files[i].originalName,
				"size": req.files[i].size,
				"b64": new Buffer(fs.readFileSync(req.files[i].path)).toString("base64")
			});
			fs.unlink(req.files[i].path);
		}
		req.files = fileInfo;

		next();
	},
		passport.authenticate('manager-signup', {
			successRedirect: '/manage-services?wizardMode=true', // redirect to the manage services
			failureRedirect: '/business-sign-up', // redirect back to the signup page if there is an error
			failureFlash: true // allow flash messages
		})
	);

	// process the signup form
	//router.post('/business-sign-up', passport.authenticate('manager-signup', {
	//    successRedirect: '/manage-services', // redirect to the manage services
	//    failureRedirect: '/business-sign-up', // redirect back to the signup page if there is an error
	//    failureFlash: true // allow flash messages
	//}));
};