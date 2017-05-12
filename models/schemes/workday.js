var mongoose = require('mongoose');

var workDaySchema = mongoose.Schema(
    {
        date: Date,
        shifts: [{
            manpower: require('./shift'),
            hours: {
                startTime: Date,
                endTime: Date
            }
        }],
        appointments: [{
            client: {type: mongoose.Schema.Types.ObjectId, ref: "client"},
            start_time: Date,
            service: {type: require('./service')}
        }]
    });

module.exports = workDaySchema;