var mongoose = require('mongoose');
var user = require('./user');

// Define client as a discriminator of user
var managerSchema = user.discriminator('manager', mongoose.Schema({
	networks_own: [{ type: mongoose.Schema.Types.ObjectId, ref: "network" }],
	branches_own: [{ type: mongoose.Schema.Types.ObjectId, ref: "branch" }]
}));

// create the model for users and expose it to our app
module.exports = managerSchema;