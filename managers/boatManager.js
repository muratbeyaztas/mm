var express = require('express'),
mongoClient = require('mongodb').MongoClient,
storeData = require('./storeManager');


var router = express.Router();
var indexpage = "./boat/index";
var viewmodel = {
	boats:{},
	error:""
};
var boatCollectionName = "Boats";
var boatModel = {
	id: '',
	name: '',
	createdDate: ''
}


router.get('/',function(req,res){

	// getBoats(getBoatsSuccess,getBoatSError);

	mongoClient.connect(storeData.mongoConString,function(err,db){

		if(!err){

			var boatCollection = db.collection(boatCollectionName);
			boatCollection.find().toArray(function(err, boats){

				viewmodel.boats = boats;
				viewmodel.error = "",
				res.render(indexpage, { model: viewmodel });
			});
			db.close();
		}
		else{
			viewmodel.boats = [];
			viewmodel.error = "database bağlanılamadı!!";
			res.render(indexpage);
		}
	});
	// res.render('./boat/index', { title: 'Murat, World!' } );	
});


router.post('/sil/:bootId',function(req,res){

});

router.post('/ekle',function(req,res){

	mongoClient.connect(function(err,db){

		var boatname = req.body.bname;
		viewmodel.error = "test";
		if(err){
			viewmodel.error = "database bağlanılamadı";
		}
		if(!boatname){
			viewmodel.error = "tekne ismini boş bırakmayaınız";
			boatCollection.find().toArray(function(err,result){
				viewmodel.boats = result;
			});
		}
		else{
			var boatCollection = db.collection(boatCollectionName);
			boatModel.name = boatname;
			boatModel.createdDate = new Date();

			boatCollection.insert(boatModel,function(err,result){

				if(err){
					viewmodel.err = "tekne kaydedilemedi: error: " + JSON.stringfy(err);
				}
				else{
					viewmodel.err = "tekne başarıyla kaydedildi.";

				}
			});

			boatCollection.find().toArray(function(err,result){
				viewmodel.boats = result;
			});

		}
		db.close();
		res.render(indexpage,{ model:viewmodel });
	});
});

module.exports = router;