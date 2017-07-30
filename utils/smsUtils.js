module.exports = function ()
{
	var sendSms = function (target, message)
	{
		var example = new SmsModel();
		example.target = target;
		example.message = message;
		example.save(function (err)
		{
			if (err)
			{
				console.log(err);
			}
		});
	}
}
