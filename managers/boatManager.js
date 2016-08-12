var express = require('express'),
	mongoClient = require('mongodb').MongoClient,
	storeData = require('./storeManager'),
	_ = require("underscore"),
	objectId = require('mongodb').ObjectID;


var router = express.Router(),
	indexpage = "./boat/index",
	boatCollectionName = "boats";


// Model begins
function boatViewModel(boats, error) {
	this.boats = boats || [];
	this.error = error || "";
}

function boatModel(id, name, createdDate) {
	this.id = id || 0;
	this.name = name || "";
	this.createdDate = createdDate;
}
// Model ends

router.get('/sil/:boatId', deleteBoat);
router.post('/ekle', addBoat);
router.get(['/', '/liste'], getBoats);


function getBoats(req, res) {

	var viewmodel = new boatViewModel();
	mongoClient.connect(storeData.mongoConString, function (err, db) {
		if (!err) {
			var boatCollection = db.collection(boatCollectionName);
			boatCollection.find().sort({ "createdDate": -1 }).toArray(function (err, boats) {

				viewmodel.error = "";
				viewmodel.boats = boats;
				res.render(indexpage, { model: viewmodel });
			});
			if (db) {
				db.close();
			}
		}
		else {
			viewmodel.boats = [];
			viewmodel.error = "database bağlanılamadı!!";
			res.render(indexpage, { model: viewmodel });
		}
	});
}

function deleteBoat(req, res) {

	var viewmodel = new boatViewModel();
	var boatId = req.params.boatId;
	mongoClient.connect(storeData.mongoConString, function (err, db) {

		if (err) {
			viewmodel.error = "database bağlantısında sorun var";
		}
		else {
			var boatColletion = db.collection(boatCollectionName);
			boatColletion.deleteOne({ "_id": new objectId(boatId) }, function (err, result) {
				viewmodel.error = "kayıt başarıyla silindi. DeletedCount: " + result.deletedCount;
				res.redirect("/tekne/liste");
			});
		}
	});
}

function addBoat(req, res) {

	var viewmodel = new boatViewModel();
	var boatmodel = new boatModel();
	mongoClient.connect(storeData.mongoConString, function (err, db) {

		var boatname = req.body.bname;
		var boatCollection = db.collection(boatCollectionName);
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
			boatCollection = db.collection(boatCollectionName);
			boatmodel.name = boatname;
			boatmodel.createdDate = new Date();

			boatCollection.insert(boatmodel, function (err, result) {

				if (err) {
					viewmodel.err = "tekne kaydedilemedi: error: " + JSON.stringfy(err);
				}
				else {
					viewmodel.err = "tekne başarıyla kaydedildi.";

				}
			});

			res.redirect("/tekne/liste");
		};
		db.close();
	});
}

module.exports = router;