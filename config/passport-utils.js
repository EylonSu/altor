var bcrypt = require('bcrypt-nodejs');
module.exports = {
    generateHash: function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },
    validPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    },

    ValidateEmail: function validateEmail(email) {
        //var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //return re.test(email);
		return true; //TODO unmark above and delete return true
    },

    validatePassword: function validatePassword(fld, error) {

        ////var error = "";
        //var illegalChars = /[\W_]/; // allow only letters and numbers
        ////   var fld = document.getElementById('pass2');

        //if (fld.value == "") {
        //    error.errorDes = "The password is empty. \n";
        //    return false;

        //} else if ((fld.length < 7) || (fld.length > 15)) {
        //    error.errorDes = "The password is in the wrong length. \n";
        //    return false;

        //} else if (illegalChars.test(fld)) {
        //    error.errorDes = "The password contains illegal characters.\n";
        //    return false;

        //} else if ((fld.search(/[a-zA-Z]+/) == -1) || (fld.search(/[0-9]+/) == -1)) {
        //    error.errorDes = "The password must contain at least one numeral.\n";
        //    return false;

        //} else {
        //}
		return true;//TODO unmark above and delete return true  + reshare code of passport utils
    }
};