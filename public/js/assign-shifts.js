'use strict'

function openMessageModal()
{
	var workdayId = document.forms["shiftEditionForm"]["workdayId"].value;
	var shiftId = document.forms["shiftEditionForm"]["shiftId"].value;

	$('#sendMessageForm').find('#workdayId').attr('value', workdayId);
	$('#sendMessageForm').find('#shiftId').attr('value', shiftId);
	$('#sendMessageModal').modal('show');
}

$(document).ready(function ()
{
	// page is now ready, initialize the calendar...
	$('#calendar').fullCalendar({
		// put your options and callbacks here
		defaultView: "agendaWeek",
		locale: 'he',
		timezone: 'local',
		events: '/get-events',
		dayClick: function (date, jsEvent, view)
		{
			// Adding the selected date to the sent form data
			$('#shiftAssignmentForm').find('#chosenDate').attr('value', date.toDate());
			// Opening the modal
			$('#assignShiftModal').find('.modal-title').html('Assign Shift - ' + date.format('L'));
			$('#assignShiftModal').modal('show');
		},
		eventClick: function (calEvent, jsEvent, view)
		{
			$.get("/get-event", { workdayId: calEvent.workdayId, shiftId: calEvent.shiftId },
				function (data)
				{
					$('#editShiftModal').find('.modal-title').html('View shift');
					$('#shiftEditionForm').find('#workdayId').attr('value', calEvent.workdayId);
					$('#shiftEditionForm').find('#shiftId').attr('value', calEvent.shiftId);
					//$('#editShiftModal').find('.modal-title').html('WorkdayId - ' + calEvent.workdayId + ' shiftId - ' + calEvent.shiftId);
					$('#shiftHoursFrom').val('16:00');
					$('#editShiftModal').modal('show');
				});
			// change the border color just for fun
			$(this).css('border-color', 'red');

		}
	});
	$('.timepicker').timepicker({
		timeFormat: 'H:mm',
		interval: 30,
		defaultTime: '8',
		startTime: '0:00',
		dynamic: false,
		dropdown: true,
		scrollbar: true
	});

});
