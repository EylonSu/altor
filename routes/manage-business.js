var Network = require('../models/network');
var User = require('../models/user');
var Request = require('request');
var Url = require('url');



module.exports = function (router)
{
	router.post('/send-messages', function (req, res)
	{
		var workdayId = req.body.workdayId;
		var shiftId = req.body.shiftId;
		var userId = req.user._id;
		var text2send = req.body.text2send;
		var bSms = req.body.bsmsmessage;
		var bAltor = req.body.baltormessage;

		//get client
		Network.findOne({ '_id': req.user.networks_own[0] })
			.populate('branches')
			.exec(function (err, network)
			{
				var clients = network.branches[0].FindClientsByShift(workdayId, shiftId);
				clients.forEach(function (client)
				{
					if (bSms)
					{
						User.findOne({ _id: client.toString() }, function (err, iUser)
						{
							if (err)
							{
								console.log(err);
								return;
							}
							else
							{
								if (iUser && iUser.phone && text2send)
								{
									sendSms(iUser.phone, text2send, req.headers.host);
								}
							}
						})
					}
					if (bAltor)
					{
						sendAltorMessage(client, text2send, network.branches[0]);
					}
				});
			});

		res.redirect('back');
	});

	function sendSms(iPhone, iText2send, iHost)
	{
		Request(
			{
				method: 'POST',
				url: '/sendSMS',
				baseUrl: 'http://' + iHost,
				form: {
					target: iPhone,
					message: iText2send
				}
			},
			function (error, response, body)
			{
				if (error)
				{
					console.log(error);
				}
				if (!error && response.statusCode == 200)
				{
					console.log(body)
				}
			}
		);
	}
};