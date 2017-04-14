﻿var mongoose = require('mongoose');

var branchSchema = mongoose.Schema(
    {
        //network: ObjectId //TODO altor+
        name: { type: String, required: true, trim: true },
        managers: [{ type: [mongoose.Schema.Types.ObjectId], required: true }],
        email: { type: String, required: true, trim: true },
        categories: [String],
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
        employees: [mongoose.Schema.Types.ObjectId],
        shifts: [require('../models/schemes/shift')],
        messages: [require('../models/schemes/message')],
        services: [require('../models/schemes/service')],
    });

module.exports = mongoose.model('Branch', branchSchema);