﻿var mongoose = require('mongoose');

var networkSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        managers: [mongoose.Schema.Types.ObjectId],
        email: { type: String, required: true, trim: true },
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
        branches: [mongoose.Schema.Types.ObjectId]
    });

module.exports = networkSchema;
