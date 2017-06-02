"use strict";

var mServiceId;
var mAvailbleEvents;
var mChosenDate;
var mCurrentMonth;
var mUpdated = false;
var mBranchId;
var mEventAfterRenderHelper = true;

$.fn.bindFirst = function (name, fn)
{
	// bind as you normally would
	// don't want to miss out on any jQuery magic
	this.on(name, fn);

	// Thanks to a comment by @Martin, adding support for
	// namespaced events too.
	this.each(function ()
	{
		var handlers = $._data(this, 'events')[name.split('.')[0]];
		//console.log(handlers);
		// take out the handler we just inserted from the end
		var handler = handlers.pop();
		// move it at the beginning
		handlers.splice(0, 0, handler);
	});
};

$(document).ready(function ()
{
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
		initCalendar(mServiceId);
	});

	mBranchId = getUrlParameter('branch');
});

function serviceHasChosen(duration, serviceId)
{
	mServiceId = serviceId;
	initCalendar(serviceId);
	$('#calendar').show();
	$('#calendar').fullCalendar('render');

}

function setAppintmnt(iTime)
{
	var dateTime = iTime.split(':');
	mChosenDate.setHours(dateTime[0]);
	mChosenDate.setMinutes(dateTime[1]);

	$.post('/set-appintmnt', { branchId: getUrlParameter('branch'), serviceId: mServiceId, dateTime: mChosenDate });
}

function initCalendar(serviceId)
{
	$('#calendar').fullCalendar({
		// put your options and callbacks here
		defaultView: "month",
		locale: 'he',
		timezone: 'local',
		events: function (start, end, timezone, callback)
		{
			mEventAfterRenderHelper = true;

			var m = start.add(7, 'days');
			m = m.toDate();
			$.get("/get-branch-events?branch=" + mBranchId + '&serviceId=' + mServiceId + '&month=' + m.getTime(),
				function (data)
				{
					callback(data);
				});
		},
		eventAfterRender: function (event, element, view)
		{
			event.rendering = "background";
			event.allDay = true;
			if (mEventAfterRenderHelper)
			{
				$('#calendar').fullCalendar('renderEvent', event);
				mEventAfterRenderHelper = false;
			}
		},
		dayClick: function (date, jsEvent, view)
		{
			if ($(jsEvent.target).hasClass("disabled"))
			{
				return false;
			}
			// Adding the selected date to the sent form data
			$('#setAppintmntForm').find('#chosenDate').attr('value', date.toDate());
			$('#setAppintmntForm').find('#serviceId').attr('value', serviceId);
			$('#setAppintmntForm').find('#branchId').attr('value', branchId);

			// Opening the modal
			$('#setAppintmnt').find('.modal-title').html('Set appointment - ' + date.format('L'));
			mChosenDate = new Date(date);

			var openSpotsArr = getOpenSpotsPerDate(date);
			if (!openSpotsArr) return; /// no available spots on this day- return
			openSpotsArr.forEach(function (iOpenSpot)
			{
				var date = new Date(iOpenSpot);
				var hours = date.getHours();
				var min = date.getMinutes();
				var time = hours + ":" + min;
				var listItem = '<li><a onclick="setAppintmnt(';
				listItem = listItem + "'" + time + "')" + '"' + " href='#'>" + time + '</a></li>';
				$('#openSpots').append(listItem);
			});

			$('#setAppintmnt').modal('show');
		},
	});

}

function getOpenSpotsPerDate(iDate)
{
	var res;

	mAvailbleEvents = $('#calendar').fullCalendar('clientEvents');

	mAvailbleEvents.forEach(function myfunction(iEvent)
	{
		if (new Date(iEvent.date).getDate() == new Date(iDate.toString()).getDate())
		{
			res = iEvent.openSpots[0];
		}
	});

	return res;
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



function showApp()
{
	$('#appintmnt-app').show();
}

var geocoder;
var map;
function initialize(adr)
{
	var address = adr;
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(-34.397, 150.644);
	var myOptions = {
		zoom: 15,
		center: latlng,
		mapTypeControl: true,
		mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
		navigationControl: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	if (geocoder)
	{
		geocoder.geocode({ 'address': address }, function (results, status)
		{
			if (status == google.maps.GeocoderStatus.OK)
			{
				if (status != google.maps.GeocoderStatus.ZERO_RESULTS)
				{
					map.setCenter(results[0].geometry.location);

					var infowindow = new google.maps.InfoWindow(
						{
							content: '<b>' + address + '</b>',
							size: new google.maps.Size(150, 50)
						});

					var marker = new google.maps.Marker({
						position: results[0].geometry.location,
						map: map,
						title: address
					});
					google.maps.event.addListener(marker, 'click', function ()
					{
						infowindow.open(map, marker);
					});

				} else
				{
					alert("No results found");
				}
			} else
			{
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	}
}