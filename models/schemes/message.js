var mongoose = require('mongoose');

var messageSchema =  mongoose.Schema(
    {
        subject: { type: String, required: true },
        from: { type: mongoose.Schema.Types.ObjectId, required: true },
        to: { type: mongoose.Schema.Types.ObjectId, required: true },
        content: String,
        has_read: { type: Boolean, default: false },
        sent_time: { type: Date, default: Date.now }
    });

module.exports = messageSchema;