﻿var mongoose = require('mongoose');

var networkSchema =  mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        managers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        categories: [String],
        logo_path: { type: String },
        address:
        {
            country: String,
            city: String,
            street: String,
            number: Number
        },
        messages: [require('../models/schemes/message')],
        branches:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }]
    });

module.exports = mongoose.model('network', networkSchema);
