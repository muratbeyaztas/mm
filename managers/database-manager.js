var mongoose = require('mongoose'),
    appsettings = require('../appsettings');

var dbURI = appsettings.connectionStrings.mongoDev;
mongoose.connect(dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
    mongoose.connect(dbURI);
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});


var schema = mongoose.Schema;

var userSchema = new schema({
    _id: schema.Types.ObjectId,
    username: { type: String, lowercase: true, trim: true },
    password: String,
    active: { type: Boolean, default: true },
    createdDate: { type: Date, default: Date.now() }
});

var boatSchema = new schema({
    name: String,
    createdDate: { type: Date, default: Date.now() }
});

var eventSchema = new schema({
    boatId: schema.Types.ObjectId,
    subject: String,
    description: String,
    startDate: Date,
    startTime: Number,
    endTime: Number,
    personCount: Number,
    startLocation: String,
    endLocation: String,
    fee: String,
    hasDinner: Boolean,
    sell: Number,
    earnestMoney: Number,
    moneyType1: String,
    moneyType2: String,
    moneyType3: String
});

var trackerSchema = new schema({
    ip: String,
    url: String,
    params: { type: schema.Types.Mixed, default: {} },
    body: {},
    query: {},
    statusCode: String,
    statusMessage: String,
    authenticated: {},
    createdDate: { type: Date, default: Date.now() }
});

function getUserModel() {
    return mongoose.model('users', userSchema);
}

function getEventModel() {
    return mongoose.model('events', eventSchema);
}

function getBoatModel() {
    return mongoose.model('boats', boatSchema);
}

function getTrackerModel() {
    return mongoose.model('trackers', trackerSchema);
}

module.exports = {
    getUserModel: getUserModel,
    getEventModel: getEventModel,
    getBoatModel: getBoatModel,
    getTrackerModel: getTrackerModel
};