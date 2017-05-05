var mongoose = require('mongoose');

var serviceSchema = mongoose.Schema(
    {
        name: String,
        duration: Number,
        note: String
    });

module.exports = serviceSchema;