"use strict";
var mServiceId;
var mAvailbleEvents;
var mChosenDate;
var mCurrentMonth;
var mUpdated = false;

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
		console.log(handlers);
		// take out the handler we just inserted from the end
		var handler = handlers.pop();
		// move it at the beginning
		handlers.splice(0, 0, handler);
	});
};

function serviceHasChosen(duration, serviceId)
{
	var month = new Date();
	var branchId = getUrlParameter('branch');
	mServiceId = serviceId;
	$.get("/get-branch-events?branch=" + branchId + '&serviceId=' + serviceId + '&month=' + month.getTime(), function (data)
	{
		mAvailbleEvents = data;
		initCalendar(serviceId);

		$('.fc-prev-button').bindFirst('click', function ()
		{
			var m = $('#calendar').fullCalendar('getDate').toDate();
			m = new Date(m.setMonth(m.getMonth() - 1));
			mUpdated = false;
			setAvlbleEventsSync(m);
		});
		$('.fc-next-button').bindFirst('click', function ()
		{
			var m = $('#calendar').fullCalendar('getDate').toDate();
			m = new Date(m.setMonth(m.getMonth() + 1));
			mUpdated = false;
			setAvlbleEventsSync(m);
		});
	});
	$('#calendar').show();

}

function setAvlbleEventsSync(iMonth)
{
	var branchId = getUrlParameter('branch');
	
	jQuery.ajaxSettings.async = false;
	$.get("/get-branch-events?branch=" + branchId + '&serviceId=' + mServiceId + '&month=' + iMonth.getTime(),
		function (data)
		{
			mAvailbleEvents = data;
			mUpdated = true;
		});
	jQuery.ajaxSettings.async = true;
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
	var branchId = getUrlParameter('branch');

	$('#calendar').fullCalendar({
		// put your options and callbacks here
		defaultView: "month",
		locale: 'he',
		timezone: 'local',
		events: null,
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
		dayRender: function (date, cell)
		{
			if (mUpdated)
			{
				paintDay(date, cell);
			}
			else
			{
				setAvlbleEventsSync(date.add(8, 'days').toDate());
				paintDay(date, cell);
			}
		},
	});
}

function paintDay(date,cell)
{
	var isDayValid = false;
	mAvailbleEvents.forEach(function myfunction(iEvent)
	{
		if (new Date(iEvent.date).getDate() == new Date(date.toString()).getDate())
		{
			cell.css("background-color", "#266526");
			cell.removeClass('disabled');
			isDayValid = true;
		}
		else
		{
			if (!isDayValid)
			{
				cell.css("background-color", "#DADADA");
				cell.addClass('disabled');
			}
		}
	});
}

function getOpenSpotsPerDate(iDate)
{
	var res;

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
});

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