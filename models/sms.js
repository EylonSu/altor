﻿var mongoose = require('mongoose');

var smsSchema = mongoose.Schema(
    {
        target: { type: String, required: true, trim: true },
		message: { type: String, required: true },
		has_sent: { type: Boolean, default: false},
    });

module.exports = mongoose.model('Sms', smsSchema);