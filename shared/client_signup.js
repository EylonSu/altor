(function (exports)
{
	function checkEmail()
	{
		$("#submitValidate").hide();
		var email = document.getElementById('email');
		if (email.value == null || email.value == "")
		{
			$("#emailIssue").hide()
		};
		//return false;


		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

		if (!filter.test(email.value))
		{
			$("#emailIssue").show();
			//alert('Please provide a valid email address');
			email.focus;
			return false;
		}
		return true;
	}

	function validatePassword(fld)
	{
		//$("#submitValidate").hide();
		//var error = "";
		//var illegalChars = /[\W_]/; // allow only letters and numbers
		////   var fld = document.getElementById('pass2');

		//$("#passwordIssue").hide();
		//if (fld.value == "") {
		//    //            //fld.style.background = 'Red';
		//    //            error = "You didn't enter a password.\n";
		//    //            $("#passwordIssue").show();
		//    return false;

		//} else if ((fld.value.length < 7) || (fld.value.length > 15)) {
		//    error = "The password is the wrong length. \n";
		//    //fld.style.background = 'Red';
		//    $("#passwordIssue").html(error).show();
		//    return false;

		//} else if (illegalChars.test(fld.value)) {
		//    error = "The password contains illegal characters.\n";
		//    //fld.style.background = 'Yellow';
		//    $("#passwordIssue").html(error).show();
		//    return false;

		//} else if ((fld.value.search(/[a-zA-Z]+/) == -1) || (fld.value.search(/[0-9]+/) == -1)) {
		//    error = "The password must contain at least one numeral.\n";
		//    //fld.style.background = 'white';
		//    $("#passwordIssue").html(error).show();
		//    return false;

		//} else {
		//    $("#passwordIssue").hide();
		//    fld.style.background = 'White';
		//}
		return true;
	}

	function verifyPassword()
	{
		//$("#submitValidate").hide();
		//var pass = document.getElementById('pass');

		//if (pass.value != null || pass.value != "") {
		//    if (pass.value === document.getElementById('pass2').value) {
		//        $("#passConfirm").hide();
		//        return true;
		//    }
		//    else
		//    {
		//        $("#passConfirm").show();
		//        return false;
		//    }
		//}

		return true;
	}

	$('#form').submit(function ()
	{

		if (verifyPassword() && checkEmail() && validatePassword(pass) && $.trim($("#lastName").val()) != "" && $.trim($("#firstName").val()) != "")
		{
			return true;
		}
		$("#submitValidate").show();
		return false;
	});

}(typeof exports === 'undefined' ? this.client_signup = {} : exports));

