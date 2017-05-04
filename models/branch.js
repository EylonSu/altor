﻿var mongoose = require('mongoose');
var branchSchema = mongoose.Schema(
    {
        //branch: ObjectId //TODO altor+
        name: { type: String, required: true, trim: true },
        managers: [{ type: [mongoose.Schema.Types.ObjectId],ref: "User", required: true }],
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
        employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //        branches:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }]
        workdays: [require('../models/schemes/workday')],
        messages: [require('../models/schemes/message')],
        services: [require('../models/schemes/service')]
    });

module.exports = mongoose.model('Branch', branchSchema);