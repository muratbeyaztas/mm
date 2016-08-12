

var mongoClient = require('mongodb').MongoClient;
var trackerCollectionName = "trackers";


// model begins
function trackerModel(req, res){
    this.ip = req.headers["x-real-ip"] || req.connection.remoteAddress;
    this.url = req.url;
    this.params = req.params;
    this.body = req.body;
    this.query = req.query;
    this.statusCode = res.statusCode;
    this.statusMessage = res.statusMessage;
    this.isAjaxReq = req.xhr;
    this.authenticated = req.authenticated;
    this.date = new Date();
}
// model ends


function trackUrl(req, res, next){

        var db = req.app.locals.db;
        next();
        var model = new trackerModel(req, res);
        var trackers = db.collection(trackerCollectionName);
        trackers.insert(model, function(err, result){});
}

module.exports = trackUrl;