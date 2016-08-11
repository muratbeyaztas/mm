

var mongoClient = require('mongodb').MongoClient;

var storeData = require('./managers/storeManager');

var trackerCollectionName = "trackers";


// model begins
function trackerModel(req){
    this.ip = req.ip;
    this.url = req.url;
    this.params = req.params;
    this.body = req.body;
    this.queryString = req.queryString;
}
// model ends


function trackUrl(req, res, nex){

    mongoClient.connect(storeData.mongoConString, function(err, db){

        var model = new trackerModel(req); 
        var trackers = db.collection(trackerCollectionName);
        trackers.insert(model, function(err, result){
            db.close();
        });
    });
}

module.exports = trackUrl;