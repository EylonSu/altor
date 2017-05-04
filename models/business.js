var mongoose = require('mongoose');
var user = require('./user');

// Define client as a discriminator of user
var businessSchema = user.discriminator('business', new mongoose.Schema({
    network: mongoose.Schema.Types.ObjectId
}));

// create the model for users and expose it to our app
module.exports = businessSchema;