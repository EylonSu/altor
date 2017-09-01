"use strict";

var mServiceId;
var mAvailbleEvents;
var mChosenDate;
var mBranchId;
var mChoosenDate;
var mEventAfterRenderHelper = true;
var mCalendar;
var mOfferedApps;
var appToSwitch;
var isMapInitialized = false;

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
    $("#map").on("shown.bs.modal", function () {
        var currentCenter = map.getCenter();  // Get current center before resizing
        google.maps.event.trigger(map, "resize");
        map.setCenter(currentCenter);
    });
    var adr = $("#address").text();
    if(!isMapInitialized){
        initializeMap(adr);
        isMapInitialized = true;
    }
});

function switchRequest(index)
{
    appToSwitch = mOfferedApps[index];
    $('#switchApp').modal('hide');
    $('#clientApp').modal('show');

}



function appChoosen(clientApp, id){
	var newApp = JSON.parse(clientApp);

	newApp.client = id;

    var oldApp = {
		branch :  newApp.branch,
		date_and_time : appToSwitch.date_and_time,
		service : appToSwitch.service,
        client : appToSwitch.client,
	};
    $.ajax({
        type: "POST",
        url: '/secondHandShake',
        data:{newApp : JSON.stringify(newApp),
              oldApp : JSON.stringify(oldApp),
        },
        success: function (data, status)
        {
            $('#clientApp').modal('hide');
            $('#reqSendSuccessfully').modal('show');
        },
        error:function (err)
        {

        }
    });
}
function showOfferedApps(){
    $.ajax({
        type: "GET",
        url: '/getWorkdayOfferedApps',
        data:{date : mChoosenDate,
		branchid : mBranchId,
        serviceId : mServiceId
        },
        success: function (data, status)
        {
            mOfferedApps = data;
            var tableJQ = $('#swith_table_body')
            tableJQ.empty();

            for(var i=0 ; i< data.length; i++)
            {
                var trItem = '<tr><td>' + moment(data[i].date_and_time).format('hh:mm') + '</td><td>'+data[i].service.name + '</td>' + '<td>' +
                    '<button type=button id="switchReq_'+i + '" onclick="switchRequest('+i+')" class="btn btn-warning">Switch request</button>'
                    +'</td></tr>' ;
                tableJQ.append(trItem)
            }

            $('#setAppintmnt').modal('hide');
            $('#switchApp').modal('show');
            console.log(data);
        },
        error:function (err)
        {
            console.log(err);
        }
    });
}
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
            mChoosenDate = date.toDate();
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
				var listItem = '<option >' + time + '</option>';
				openSpotsJQ.append(listItem);
			});


			var selectedTime = openSpotsJQ.find(":selected").text()
			$('#setAppintmntForm').find('#Time').attr('value', selectedTime);

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
	mAvailbleEvents = mCalendar.fullCalendar('clientEvents');

	mAvailbleEvents.forEach(function myfunction(iEvent)
	{
		if (new Date(iEvent.date).getDate() == new Date(iDate.toString()).getDate())
		{
			res = iEvent.openSpots[0];
		}
	});
    res.sort(function(a,b){

        return new Date(a) - new Date(b);
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