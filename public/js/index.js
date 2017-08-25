/**
 * Created by MaorDavidzon on 8/15/2017.
 */
'use strict'

var cancelurl = "";
var replacelurl = "";
var trID ;
function  confirmCancel(url, id)
{
    $('#confCancel').modal('show');
    cancelurl = url;
    trID = 'cancel_row_'+id;
}

function  confirmReplacment(url, id)
{
    $('#confReplacment').modal('show');
    replacelurl = url;
}

function ajaxRequestForCancel()
{
    $('#loader').show();
    $('#cancel').attr("disabled", true);
    $.ajax({
        type: "GET",
        url: cancelurl,
        success: function (data, status)
        {
            console.log(data);
            $('#confCancel').modal('hide');
            $('#cancel').attr("disabled", false);
            $('#loader').hide();
            $('#successCancel').modal('show');
            $('#'+trID).remove();
        },
        error:function (err)
        {
            console.log(err);
        }
    });
}



function ajaxRequestForReplacmentOffer()
{
    $('#loader2').show();
    $('#confirm').attr("disabled", true);
    $.ajax({
        type: "GET",
        url: replacelurl,
        success: function (data, status)
        {
            console.log(data);
            $('#confReplacment').modal('hide');
            $('#loader2').hide();
            $('#successOffer').modal('show');
        },
        error:function (err)
        {
            console.log(err);
        }
    });
}

function switchApps(apps)
{
    $.ajax({
        type: "POST",
        url: '/thirdHandShake',
        data:{apps : apps},
        success: function (data, status)
        {
            $('#switchAppApproved').modal('show');
        },
        error:function (err)
        {

        }
    });
}