
var express = require('express'),
	mongoClient = require('mongodb').MongoClient,
	storeData = require('./storeManager');


var router = express.Router();



router.get('/',function(req,res){

	mongoClient.connect(storeData.mongoConString,function(err,db){

		if(!err){

			var boatCollection = db.collection("Boats");
			boatCollection.find().toArray(function(err, boats){

				res.render('./boat/index',{model: boats});
			});
			db.close();
		}
		else{
			res.send("mongodb ye bağlanamadı");
		}
	});
	// res.render('./boat/index', { title: 'Murat, World!' } );	
});


router.post('/sil/:bootId',function(req,res){

});

router.post('/ekle',function(req,res){

});


module.exports = router;