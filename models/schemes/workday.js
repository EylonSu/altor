/**
 * Created by dell on 01/05/2017.
 */
var mongoose = require('mongoose');

var workDaySchema = mongoose.Schema(
    {
        date: Date,
        shifts: [{
            capabality: require('./shift'),
            active_hours: [{
                start_time: Date,
                end_time: Date
            }]
        }],
        appointments: [{
            client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
            start_time: Date,
            service: {
                type: require('./service'),
                validat: {
                    validator: function (v) {
                        return this.services.includes(v);
                    },
                    message: "You can only set appointments that is within the employyee services"
                }
            }
        }]
    });

module.exports = workDaySchema;