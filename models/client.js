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
        }],

        waiting_for_confirim:[{
            oldApp : { branch_name: String,
                branch: { type: mongoose.Schema.Types.ObjectId, ref: "branch" },
                date_and_time: Date,
                service: require('../models/schemes/service'),
                client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
            },
            newApp : { branch_name: String,
                branch: { type: mongoose.Schema.Types.ObjectId, ref: "branch" },
                date_and_time: Date,
                service: require('../models/schemes/service'),
                client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
            }
        }]
    }));

// create the model for users and expose it to our app
module.exports = clientSchema;
