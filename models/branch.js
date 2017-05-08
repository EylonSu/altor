﻿var mongoose = require('mongoose');

var branchSchema = mongoose.Schema(
    {
        //branch: ObjectId //TODO altor+
        name: { type: String, required: true, trim: true },
        managers: [{ type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true }],
        email: { type: String, required: true, trim: true },
        phone: { type: String },
        picture_path: { type: String },
        address:
        {
            country: String,
            city: String,
            street: String,
            number: Number
        },
        //queues: [require('../models/queue')], //TODO altor+

        messages: [require('../models/schemes/message')],
        employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        services: [require('../models/schemes/service')],
        default_shifts: [require('../models/schemes/shift')],
        workdays: [require('../models/schemes/workday')]
    });

module.exports = mongoose.model('Branch', branchSchema);