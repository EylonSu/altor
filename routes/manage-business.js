var Network = require('../models/network');

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
				//send text2send foreach client
				clients.forEach(function (client)
				{
					if (bSms)
					{//TODO eylon
						sendSms(client.Phone, text2send);
					}
					if (bAltor)
					{
						sendAltorMessage(client, text2send, network.branches[0]);
					}
				});
			});


	});
};