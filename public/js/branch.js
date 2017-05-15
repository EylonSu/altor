"use strict";
var _serviceId;

function serviceHasChosen(duration, serviceId)
{
	_serviceId = serviceId;
	$('#calendar').show();
	initCalendar(serviceId);
}

function initCalendar(serviceId)
{
	var branchId = getUrlParameter('branch');

	$('#calendar').fullCalendar({
		// put your options and callbacks here
		defaultView: "agendaWeek",
		locale: 'he',
		timezone: 'local',
		events: '/get-branch-events?branch=' + branchId + '&serviceId=' + serviceId,
		dayClick: function (date, jsEvent, view)
		{
			// Adding the selected date to the sent form data
			$('#setAppintmntForm').find('#chosenDate').attr('value', date.toDate());
			$('#setAppintmntForm').find('#serviceId').attr('value', serviceId);
			$('#setAppintmntForm').find('#branchId').attr('value', branchId);

			// Opening the modal
			$('#setAppintmnt').find('.modal-title').html('Set appointment - ' + date.format('L'));
			$('#setAppintmnt').modal('show');
		},
		eventClick: function (calEvent, jsEvent, view)
		{
			$.get("/get-event", { workdayId: calEvent.workdayId, shiftId: calEvent.shiftId },
				function (data)
				{
					$('#editShiftModal').find('.modal-title').html('View shift - ' + data.name);
					$('#shiftEditionForm').find('#workdayId').attr('value', calEvent.workdayId);
					$('#shiftEditionForm').find('#shiftId').attr('value', calEvent.shiftId);
					$('#editShiftModal').find('.modal-title').html('WorkdayId - ' + calEvent.workdayId + ' shiftId - ' + calEvent.shiftId);
					$('#editShiftModal').modal('show');
				});
			// change the border color just for fun
			$(this).css('border-color', 'red');

		},
	});
}

var getUrlParameter = function getUrlParameter(sParam)
{
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++)
	{
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam)
		{
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

$(document).ready(function ()
{
	$('.timepicker').timepicker({
		timeFormat: 'HH:mm',
		interval: 15,
		minTime: '00',
		maxTime: '23',
		defaultTime: '08',
		startTime: '08:00',
		dynamic: false,
		dropdown: true,
		scrollbar: true
	});

	$("#setAppintmntForm").submit(function (e)
	{
		var url = "/set-appintmnt";

		$.ajax({
			type: "POST",
			url: url,
			data: $("#setAppintmntForm").serialize(), // serializes the form's elements.
			success: function (data)
			{
				console.log(data);
			}
		});

		e.preventDefault(); // avoid to execute the actual submit of the form.
		$('#setAppintmnt').modal('hide');
		initCalendar(_serviceId);
	});
});

function showApp()
{
	$('#appintmnt-app').show();
}