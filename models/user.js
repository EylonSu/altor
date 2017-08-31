var mongoose = require('mongoose');
var PassportUtils = require('../config/passport-utils');

var userSchema = new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        phone: { type: String, trim: true },
        email: { type: String, required: true, trim: true },
        password: { type: String, required: true },
		join_date: Date,
        messages: [require('../models/schemes/message')]
    },
    { discriminatorKey: 'role' });


// generating a hash
userSchema.methods.generateHash = PassportUtils.generateHash;

// checking if password is valid
userSchema.methods.validPassword = PassportUtils.validPassword;

// Get full name
userSchema.methods.getFullName = function () {
    return this.first_name + ' ' + this.last_name;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);