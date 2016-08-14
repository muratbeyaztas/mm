

// var mongoClient = require('mongodb').MongoClient;
// var trackerCollectionName = "trackers";
var databaseManager = require('./database-manager');


function trackUrl(req, res, next) {

    next();
    var tracker = databaseManager.getTrackerModel();
    var newTracker = new tracker();
    newTracker.ip = req.headers["x-real-ip"] || "bos";
    newTracker.url = req.url;
    newTracker.params = req.params || null;
    newTracker.body = req.body || null;
    newTracker.query = req.query || null;
    newTracker.statusCode = res.statusCode;
    newTracker.statusMessage = res.statusMessage;
    newTracker.isAjaxReq = req.xhr;
    newTracker.authenticated = req.authenticated;
    newTracker.save(function (err, result) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = trackUrl;