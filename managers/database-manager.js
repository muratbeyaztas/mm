
var mongoClient = require('mongodb').MongoClient;

var databaseManager = (function(){

    var database;

    function connect(req){

        mongoClient.connect(storeManager.mongoConString, function(err, db){
            db = db;
        });
    }

    function close(){
        if(database){
            database.close();
        }
    }


    function init(req, res, next){
        
        connect();
        next();
        close();
    }

    return {
        database: database,
        connect: connect,
        close: close,
        init: init
    }
})();

module.exports = databaseManager;