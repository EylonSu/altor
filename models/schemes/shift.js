﻿var mongoose = require('mongoose');

var shiftSchema = mongoose.Schema(
    {
        title: String,
        stations: [{
            services: [{type: [mongoose.Schema.ObjectId], ref: "service", required: true}],
            numOfServiceProviders: Number
        }]
    });

module.exports = shiftSchema;