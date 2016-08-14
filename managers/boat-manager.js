var express = require('express'),
	_ = require("underscore"),
	databaseManage = require('./database-manager');


var router = express.Router(),
	indexpage = "./boat/index",
	boatCollectionName = "boats";


router.get('/sil/:boatId', deleteBoat);
router.post('/ekle', addBoat);
router.get(['/', '/liste'], getBoats);


function getBoats(req, res) {

	var viewmodel = new boatViewModel();
	var boatCollection = db.collection(boatCollectionName);
	var boats = databaseManage.getBoatModel();

	boats.find().sort({ createdDate: -1 }).exec(function (err, results) {
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