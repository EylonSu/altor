/**
 * Created by MaorDavidzon on 8/15/2017.
 */
'use strict'

var cancelurl = "";
var trID ;
function  confirmCancel(url, id)
{
    $('#confCancel').modal('show');
    cancelurl = url;
    trID = 'cancel_row_'+id;
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