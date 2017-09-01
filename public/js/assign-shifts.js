'use strict'
var todayAppointments;
var indexOfApp;
function openMessageModal()
{
	var workdayId = document.forms["shiftEditionForm"]["workdayId"].value;
	var shiftId = document.forms["shiftEditionForm"]["shiftId"].value;

	$('#sendMessageForm').find('#workdayId').attr('value', workdayId);
	$('#sendMessageForm').find('#shiftId').attr('value', shiftId);
	$('#sendMessageModal').modal('show');
}

function cancelApp(index)
{
    var appToDel = todayAppointments[index];
	var userId = appToDel.client;
    $.ajax({
        type: "GET",
        url: '/BranchDeleteAppointment?appToDel='+JSON.stringify(appToDel)+ '&userId=' + userId,

        success: function (data, status)
        {
            console.log(data);
            openAppsModal();
        },
        error:function (err)
        {
            console.log(err);
        }
    });
}
function sendMsg(index)
{
    indexOfApp = index;
    $('#showAppsModal').modal('hide');
    $('#sendMessagetoSpecificClientModal').modal('show');
}

function sendSms()
{
    var appToDel = todayAppointments[indexOfApp];
    var userId = appToDel.client;

    $.ajax({
        type: "POST",
        url: '/sendSmsToSpesificClient',
        data:{ clientId : appToDel.client, msg:$("#text2sendToSpecifClient").val()
        },
        success: function (data, status)
        {
            $('#sendMessagetoSpecificClientModal').modal('hide');
            $('#successfullySend').modal('show');
        },
        error:function (err)
        {

        }
    });
}
function openAppsModal()
{
    var workdayId = document.forms["shiftEditionForm"]["workdayId"].value;
    $('#appointmentsTblBody').empty();
    $.ajax({
        type: "GET",
        url: '/getWorkDayAppointments',
        data:{ workdayId : document.forms["shiftEditionForm"]["workdayId"].value },
        success: function (data, status)
        {
            todayAppointments = data;
        	var index = 0;
        	//time service actions
        	$.each(data || [], function(index, appointment) {
        		var last_name = appointment.client.last_name;
        		var first_name = appointment.client.first_name;
                appointment.client = appointment.client._id;
                var child = '<tr><td>' +
                    first_name + ' ' +
					last_name +
					'</td> <td>'+
					moment(appointment.date_and_time).format('hh:mm') +
					'</td><td>' +
					appointment.service.name +
                    '</td><td>' +
					'<button onClick="sendMsg(' +
                    index + '\)" ' +
					'" type="button" class="btn btn-default">Send Message'+
					'</button><br/><br/>' +
                    '<button onClick="cancelApp(' +
                    index +
					'\)" ' +
					'type="button" class="btn btn-danger">Cancel Appointment</button></td></tr>';

				$('#appointmentsTblBody').append(child);
                index++;
			});
            $('#showAppsModal').modal('show');
        },
        error:function (err)
        {

        }
    });

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
