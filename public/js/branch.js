"use strict";

var mServiceId;
var mAvailbleEvents;
var mChosenDate;
var mCurrentMonth;
var mUpdated = false;
var mBranchId;
var mEventAfterRenderHelper = true;
var mCalendar;

$.fn.bindFirst = function (name, fn)
{
	this.on(name, fn);
	this.each(function ()
	{
		var handlers = $._data(this, 'events')[name.split('.')[0]];
		var handler = handlers.pop();
		handlers.splice(0, 0, handler);
	});
};

$(document).ready(function ()
{
	mBranchId = getUrlParameter('branch');
	mCalendar = $('#calendar');
});

function serviceHasChosen(duration, serviceId ,sName)
{
    $('#serviceChoosen').html("possible appointments for: " + sName);
	$('#serviceChoosen').show();
	mServiceId = serviceId;
	if (mCalendar.is(":visible"))
	{
		refreshCalendarView();
	}
	else
	{
		initCalendar();
		mCalendar.show();
		mCalendar.fullCalendar('render');
	}

}

function setLbl(iTime)
{
	$('set_appntmnt').click(setAppintmnt(iTime));
	$('time_lbl').text(iTime);

	//var dateTime = iTime.split(':');
	//mChosenDate.setHours(dateTime[0]);
	//mChosenDate.setMinutes(dateTime[1]);

	//$.post('/set-appintmnt', { branchId: getUrlParameter('branch'), serviceId: mServiceId, dateTime: mChosenDate });
	//$('#setAppintmnt').modal('hide');
	//refreshCalendarView()
}

function setAppintmnt(iTime)
{
	var dateTime = iTime.split(':');
	mChosenDate.setHours(dateTime[0]);
	mChosenDate.setMinutes(dateTime[1]);

	$.post('/set-appintmnt', { branchId: getUrlParameter('branch'), serviceId: mServiceId, dateTime: mChosenDate });
	$('#setAppintmnt').modal('hide');
	refreshCalendarView()
}

function refreshCalendarView()
{
	mCalendar.fullCalendar('prev');
	sleep(300);
	mCalendar.fullCalendar('next');
}

function sleep(ms) 
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

function initCalendar()
{
	mCalendar.fullCalendar({
		defaultView: "month",
		aspectRatio: 4,
		locale: 'he',
		timezone: 'local',
		lazyFetching: false,
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
				mCalendar.fullCalendar('renderEvent', event);
				mEventAfterRenderHelper = false;
			}
		},
		dayClick: function (date, jsEvent, view)
		{
			/// Adding the selected date to the sent form data
			var setAppintmntForm = $('#setAppintmntForm');
			setAppintmntForm.find('#dateTime').attr('value', date.toDate());
			setAppintmntForm.find('#serviceId').attr('value', mServiceId);
			setAppintmntForm.find('#branchId').attr('value', mBranchId);
			var openSpotsJQ = $('#openSpots');
			openSpotsJQ.empty();
			/// Opening the modal
			$('#setAppintmnt').find('.modal-title').html('Set appointment - ' + date.format('L'));
			mChosenDate = new Date(date);

			var openSpotsArr = getOpenSpotsPerDate(date);
			if (!openSpotsArr) return; /// no available spots on this day - return
			openSpotsArr.forEach(function (iOpenSpot)
			{
				var date = new Date(iOpenSpot);
				var hours = make2chars(date.getHours());
				var min = make2chars(date.getMinutes());
				var time = hours + ":" + min;
				//var listItem = '<li><a onclick="setLbl(';
				//listItem = listItem + "'" + time + "')" + '"' + " href='#'>" + time + '</a></li>';
				
				var listItem = '<option >' + time + '</option>';
				openSpotsJQ.append(listItem);
			});

			$('#setAppintmnt').modal('show');
		}
	});
}

function setTime()
{
	var selectedTime =$('#openSpots').find(":selected").text()
    var setAppintmntForm = $('#setAppintmntForm');
    setAppintmntForm.find('#Time').attr('value',selectedTime);
}
function make2chars(iNum)
{
	var str = iNum.toString();
	if (str.length < 2)
	{
		str = '0' + str;
	}

	return str;
}

function getOpenSpotsPerDate(iDate)
{
	var res;
	//mCalendar.fullCalendar('refetchEvents');
	mAvailbleEvents = mCalendar.fullCalendar('clientEvents');

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

function  showMap()
{
    $('#map').modal('show');
    var adr = $("#address").text();
    initializeMap(adr);
}

function showApp()
{
	$('#appintmnt-app').show();
}

var geocoder;
var map;
function initializeMap(adr)
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