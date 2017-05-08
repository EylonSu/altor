var mongoose = require('mongoose');

var shiftSchema = mongoose.Schema(
    {
        title: String,
        stations: [{
            services: [{type: [mongoose.Schema.ObjectId], ref: "service", required: true}],
            numOfServiceProviders: Number
        }],
        hours: {
            start_time: String,
            end_time: String
        }
    });

module.exports = shiftSchema;