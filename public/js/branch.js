"use strict";
var _serviceId;
var availbleEvents;
var chosenDate;

function serviceHasChosen(duration, serviceId)
{
	var branchId = getUrlParameter('branch');
	_serviceId = serviceId;
	$.get("/get-branch-events?branch=" + branchId + '&serviceId=' + serviceId, function (data)
	{
		availbleEvents = data;
		initCalendar(serviceId);
	});

	$('#calendar').show();
}

function setAppintmnt(iTime)
{
	var dateTime = iTime.split(':');
	chosenDate.setHours(dateTime[0]);
	chosenDate.setMinutes(dateTime[1]);

	$.post('/set-appintmnt', { branchId: getUrlParameter('branch'), serviceId: _serviceId, dateTime: chosenDate });
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
			chosenDate = new Date(date);
			var openSpotsArr = getOpenSpotsPerDate(date);
			openSpotsArr.forEach(function (iOpenSpot)
			{
				var date = new Date(iOpenSpot);
				var hours = date.getHours();
				var min = date.getMinutes();
				var time = hours + ":" + min;
				var listItem = '<li><a onclick="setAppintmnt(';
				listItem = listItem + "'" + time + "')" +'"' +" href='#'>" + time + '</a></li>';
				$('#openSpots').append(listItem);
			});

			$('#setAppintmnt').modal('show');
		},
		dayRender: function (date, cell)
		{
			var isDayValid = false;
			availbleEvents.forEach(function myfunction(iEvent)
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
		},
	});
}

function getOpenSpotsPerDate(iDate)
{
	var res;

	availbleEvents.forEach(function myfunction(iEvent)
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
	//$('.timepicker').timepicker({
	//	timeFormat: 'HH:mm',
	//	interval: 15,
	//	minTime: '00',
	//	maxTime: '23',
	//	defaultTime: '08',
	//	startTime: '08:00',
	//	dynamic: false,
	//	dropdown: true,
	//	scrollbar: true
	//});

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