var express = require('express'),
	mongoClient = require('mongodb').MongoClient,
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

	var db = req.app.locals.db;
	var viewmodel = new boatViewModel();
	var boatCollection = db.collection(boatCollectionName);
	boatCollection.find().sort({ "createdDate": -1 }).toArray(function (err, boats) {

		viewmodel.error = "";
		viewmodel.boats = boats;
		res.render(indexpage, { model: viewmodel });
	});

}

function deleteBoat(req, res) {

	var db = req.app.locals.db;
	var viewmodel = new boatViewModel();
	var boatId = req.params.boatId;
	var boatColletion = db.collection(boatCollectionName);
	boatColletion.deleteOne({ "_id": new objectId(boatId) }, function (err, result) {
		viewmodel.error = "kayıt başarıyla silindi. DeletedCount: " + result.deletedCount;
		res.redirect("/tekne/liste");
	});
}

function addBoat(req, res) {

	var viewmodel = new boatViewModel();
	var boatmodel = new boatModel();
	var db = req.app.locals.db;

	var boatname = req.body.bname;
	var boatCollection = db.collection(boatCollectionName);
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
}

module.exports = router;