var mongoose = require('mongoose');

var shiftSchema = mongoose.Schema(
    {
        Title: String,
        services: [{
            service: [{type: [mongoose.Schema.ObjectId], ref: "service", required: true}],
            numOfServiceProviders: Number,
            hours: [{
                start_time: Date,
                end_time: Date
            }]
        }]
    });

module.exports = shiftSchema;