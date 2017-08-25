'use strict'

var mCount;

function openMessagesModal()
{
	$('#MessagesModal').modal('show');
}

function deleteMessage(iMessageId)
{
	$.post('/deleteAltorMessage', { message_id: iMessageId });
	$(document.getElementById(iMessageId)).remove();
	mCount--;
	if (mCount==0)
	{
		$('#MessagesModal').modal('hide');
		$("noMessages").show();
		$(document.getElementById('messageCount')).children().text('No Incoming Messages');
	}
	else
	{
		$(document.getElementById('messageCount')).children().text(mCount + ' Incoming Messages');
	}
	
}

$(document).ready(function ()
{
	mCount = $(document.getElementById('count')).attr('count');
});