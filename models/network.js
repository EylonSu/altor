﻿var mongoose = require('mongoose');

var networkSchema =  mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        managers: [mongoose.Schema.Types.ObjectId],
        categories: [String],
        logo_path: { type: String },
        address:
        {
            country: String,
            city: String,
            street: String
        },
        messages: [require('../models/schemes/message')],
        branches:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }]
    });

module.exports = mongoose.model('network', networkSchema);
