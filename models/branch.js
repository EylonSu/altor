﻿﻿
var mongoose = require('mongoose');

var branchSchema = mongoose.Schema(
    {
        //branch: ObjectId //TODO altor+
        name: {type: String, required: true, trim: true},
        managers: [{type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true}],
        email: {type: String, required: true, trim: true},
        phone: {type: String},
        picture_path: {type: String},
        address: {
            country: String,
            city: String,
            street: String,
            number: Number
        },
        //queues: [require('../models/queue')], //TODO altor+
        employees: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        workdays: [require('../models/schemes/workday')],
        messages: [require('../models/schemes/message')],
        services: [require('../models/schemes/service')],
        default_shifts: [require('../models/schemes/shift')]
    });

module.exports = mongoose.model('Branch', branchSchema);