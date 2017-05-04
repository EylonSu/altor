var mongoose = require('mongoose');

var shiftSchema = mongoose.Schema(
    {
        shiftId: Number,
        working_employees: [{
            service: {type: [mongoose.Schema.ObjectId], ref: "service", required: true},
            numOfServiceProviders: Number
        }]
    });

module.exports = shiftSchema;
