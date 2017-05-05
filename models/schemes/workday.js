var mongoose = require('mongoose');

var workDaySchema = mongoose.Schema(
    {
        date: Date,
        shifts: [require('./shift')],
        appointments: [{
            client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
            start_time: Date,
            service: {type: require('./service')}
        }]
    });

module.exports = workDaySchema;