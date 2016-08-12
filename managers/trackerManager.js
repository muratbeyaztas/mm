

var mongoClient = require('mongodb').MongoClient;

var storeData = require('./storeManager');

var trackerCollectionName = "trackers";


// model begins
function trackerModel(req, res){
    this.ip = req.ip;
    this.url = req.url;
    this.params = req.params;
    this.body = req.body;
    this.query = req.query;
    this.statusCode = res.statusCode;
    this.statusMessage = res.statusMessage;
    this.isAjaxReq = req.xhr;
    this.authenticated = req.authenticated;
}
// model ends


function trackUrl(req, res, next){

    mongoClient.connect(storeData.mongoConString, function(err, db){

        next();
        var model = new trackerModel(req, res);
        var trackers = db.collection(trackerCollectionName);
        trackers.insert(model, function(err, result){
            db.close();
            
        });
    });
}

module.exports = trackUrl;