﻿var mongoose = require('mongoose');
var User = require('./user');

var clientSchema = User.discriminator('employee', new mongoose.Schema(
    {
        // TODO validate if service is within the business services
        services: [require('../models/schemes/service')],
        branches: [mongoose.Schema.Types.ObjectId],
        days:
        [{
            is_working_today: Boolean,
            date: Date,
            active_hours: [{
                start_time: Date,
                end_time: Date
            }],

            availability_str: String,

            appointments:
            [{
                client: mongoose.Schema.Types.ObjectId,
                start_time: Date,
                service: {
                    type: require('../models/service'),
                    validat: {
                        validator: function (v) {
                            return this.services.includes(v);
                        },
                        message: "You can only set appointments that is within the employyee services"
                    }
                }
            }]
        }]
    }));

module.exports = clientSchema;