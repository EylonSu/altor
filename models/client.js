var mongoose = require('mongoose');
var User = require('./user');

// Define client as a discriminator of user
var clientSchema = User.discriminator('client', new mongoose.Schema(
    {
        appointments: [{
            branch_name: String,
            branch: { type: mongoose.Schema.Types.ObjectId, ref: "branch" },
            date_and_time: Date,
            service: require('../models/schemes/service'),
        }]
    }));

// create the model for users and expose it to our app
module.exports = clientSchema;
