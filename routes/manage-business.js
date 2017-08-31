var Network = require('../models/network');
var User = require('../models/user');
var Request = require('request');
var Branch = require('../models/branch.js');
var moment = require('moment');
var Client = require('../models/client.js');

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
				if (!bSms && !bAltor)
				{
					res.redirect('back');
				}
				if (clients.length==0)
				{
					res.redirect('back');
				}
				clients.forEach(function (client)
				{
					User.findOne({ _id: client.toString() })
						.populate('messages')
						.exec(function (err, iUser)
						{
							if (err)
							{
								console.log(err);
							}
							else if (iUser && text2send)
							{
								if (bSms)
								{
									if (iUser.phone)
									{
										sendSms(iUser.phone, text2send, req.headers.host);
									}
								}
								if (bAltor)
								{
									sendAltorMessage(iUser, text2send, network.branches[0]);
								}
							}
							res.redirect('back');
						});
				});

			});

        function sendAltorMessage(iUser, iText2send, iBranch)
        {
            var message =
                {
                    subject: 'Message from ' + iBranch.name,
                    from: iBranch.name,
                    to: iUser._id.toString(),
                    content: iText2send,
                }

            iUser.messages.push(message);
            iUser.markModified('messages');
            iUser.save(function (err)
            {
                if (err)
                {
                    console.log(err);
                }
            })
        }


	});



    router.get('/getWorkDayAppointments', function (req, res){

    	var workdayId = req.query.workdayId;

        Network.findOne({ '_id': req.user.networks_own[0] })
               .populate({
                   path: 'branches',
                   populate: {
                       path: 'workdays.appointments.client'
                   }
               })
               .exec(function (err, network)
               {
                   var branch = network.branches[0];
				   var workDay = branch.FindWorkdayById(workdayId);
				   res.send(workDay.appointments);
			   });
	});


    router.get('/BranchDeleteAppointment', function (req, res)
    {
        var appToDel = JSON.parse(req.query.appToDel);
        var userId = req.query.userId;
		var phone;
        var x = 0;

        Network.findOne({ '_id': req.user.networks_own[0] })
               .populate('branches')
               .exec(function (err, network)
               {

                   var newBranch = network.branches[0].delAppointment(appToDel,userId);
                   if (newBranch)
                   {
                       branch = newBranch;
                       branch.markModified('workdays');
                       branch.save(function (err, updatedDoc)
                       {
                           if (err)
                           {
                               console.log(err);
                           } else
                           {
                               Client.findById(userId, function (err, client)
                               {
                                   var j;
                                   for (j = 0; j < client.appointments.length; j++)
                                   {
                                       if ((new Date(client.appointments[j].date_and_time).getTime() == new Date(appToDel.date_and_time).getTime()) && (client.appointments[j].branch.toString() == network.branches[0]._id.toString()) &&
                                           (client.appointments[j].service._id.toString() == appToDel.service._id.toString()))
                                       {
                                           client.appointments.splice(j, 1);
                                           break;
                                       }
                                   }
                                   phone = client.phone;
                                   client.save(function (err)
                                   {
                                       if (err)
                                       {
                                           throw ("error");
                                           console.log(err);
                                       }else{
                                           sendSms(phone, "Unfortunately, the "+ newBranch.name + "branch owner chose to cancel your appointment at "+moment(appToDel.date_and_time).format('dddd, MMMM Do YYYY, h:mm:ss a')+". Contact them for more details.", req.headers.host);
                                           res.send("yhaaa");
                                       }
                                   })
                               })
                           }
                       });
                   }
               });
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

    router.post('/sendSmsToSpesificClient', function (req, res)
    {
    	var text2send = req.body.msg;
    	var clientId = req.body.clientId;
    	var branchName = req.user.first_name;
        User.findOne({ _id: clientId })
            .populate('messages')
            .exec(function (err, iUser)
            {
                if (err)
                {
                    console.log(err);
                }
                else if (iUser && text2send)
                {

                        if (iUser.phone)
                        {
                            sendSms(iUser.phone, text2send, req.headers.host);
                        }
                        sendAltorMessage2(iUser, text2send, branchName);
                }
                res.redirect('back');
            });
	});


    function sendAltorMessage2(iUser, iText2send, iBranchName)
    {
        var message =
            {
                subject: 'Message from ' + iBranchName,
                from: iBranchName,
                to: iUser._id.toString(),
                content: iText2send,
            }

        iUser.messages.push(message);
        iUser.markModified('messages');
        iUser.save(function (err)
        {
            if (err)
            {
                console.log(err);
            }
        })
    }
}