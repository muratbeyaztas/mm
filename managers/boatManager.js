var express = require('express'),
	mongoClient = require('mongodb').MongoClient,
	storeData = require('./storeManager'),
	_ = require("underscore"),
	objectId = require('mongodb').ObjectID;


var router = express.Router();
var indexpage = "./boat/index";
var viewmodel = {
	boats: {},
	error: ""
};
var boatCollectionName = "Boats";
var boatModel = {
	id: '',
	name: '',
	createdDate: ''
}


router.get('/', function (req, res) {

	mongoClient.connect(storeData.mongoConString, function (err, db) {

		if (!err) {
			var boatCollection = db.collection(boatCollectionName);
			boatCollection.find().sort({ "createdDate": -1 }).toArray(function (err, boats) {

				// viewmodel.boats = _.chain(boats).sortBy(function(boat){
				// 	return -boat.createdDate;
				// }).value();
				viewmodel.error = "",
					viewmodel.boats = boats;
				res.render(indexpage, { model: viewmodel });
			});
			db.close();
		}
		else {
			viewmodel.boats = [];
			viewmodel.error = "database bağlanılamadı!!";
			res.render(indexpage);
		}
	});
	// res.render('./boat/index', { title: 'Murat, World!' } );	
});


router.get('/sil/:boatId', function (req, res) {

	var boatId = req.params.boatId;
	mongoClient.connect(storeData.mongoConString, function (err, db) {

		if (err) {
			viewmodel.error = "database bağlantısında sorun var";
		}
		else {
			var boatColletion = db.collection(boatCollectionName);
			boatColletion.deleteOne({ "_id": new objectId(boatId) }, function (err, result) {
				viewmodel.error = "kayıt başarıyla silindi. DeletedCount: " + result.deletedCount;
				res.redirect("./tekneler/");
			});
		}
	});
});

router.post('/ekle', function (req, res) {

	mongoClient.connect(storeData.mongoConString, function (err, db) {

		var boatname = req.body.bname;
		if (err) {
			viewmodel.error = "database bağlanılamadı";
		}
		if (!boatname) {
			viewmodel.error = "tekne ismini boş bırakmayaınız";
			boatCollection.find().toArray(function (err, result) {
				viewmodel.boats = result;
			});
		}
		else {
			var boatCollection = db.collection(boatCollectionName);
			boatModel.name = boatname;
			boatModel.createdDate = new Date();

			boatCollection.insert(boatModel, function (err, result) {

				if (err) {
					viewmodel.err = "tekne kaydedilemedi: error: " + JSON.stringfy(err);
				}
				else {
					viewmodel.err = "tekne başarıyla kaydedildi.";

				}
			});

			res.redirect("./");

			// boatCollection.find().toArray(function(err,result){
			// 	viewmodel.boats = result;
			// 	res.render(indexpage,{ model:viewmodel });
			// });
		}
		db.close();
	});
});

module.exports = router;