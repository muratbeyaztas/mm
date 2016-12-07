var express = require('express'),
    _ = require("underscore"),
    databaseManager = require('./database-manager'),
    mongoose = require('mongoose');


var router = express.Router(),
    indexpage = "./boat/index",
    boatCollectionName = "boats";


router.get('/sil/:boatId', deleteBoat);
router.post('/ekle', addBoat);
router.get(['/', '/liste'], getBoats);


function boatViewModel(boats, error) {
    this.boats = boats || [];
    this.error = error || "";
}

function boatViewModel(id, name, createdDate) {
    this.id = id || 0;
    this.name = name || "";
    this.createdDate = createdDate;
}

function getBoats(req, res) {

    var viewmodel = new boatViewModel();

    databaseManager
        .getBoatModel()
        .find({})
        .sort({ createdDate: -1 })
        .exec((err, boats) => {
            viewmodel.error = "";
            viewmodel.boats = boats;
            res.render(indexpage, { model: viewmodel });
        });
}

function test() {}

function deleteBoat(req, res) {

    var viewmodel = new boatViewModel();
    var boatId = req.params.boatId;
    databaseManager
        .getBoatModel()
        .remove({ "_id": new mongoose.Types.ObjectId(boatId) }, function(err, result) {
            viewmodel.error = "kayıt başarıyla silindi. DeletedCount: " + result.deletedCount;
            res.redirect("/tekne/liste");
        });
}

function addBoat(req, res) {

    var viewmodel = new boatViewModel();

    var boatname = req.body.bname;
    if (!boatname) {
        viewmodel.error = "tekne ismini boş bırakmayaınız";
        databaseManager
            .getBoatModel()
            .find()
            .toArray(function(err, result) {
                viewmodel.boats = result;
            });
    } else {

        var boatModel = databaseManager.getBoatModel();
        var newboat = new boatModel();
        newboat.name = boatname;
        newboat.createdDate = new Date();
        newboat.save((err, evnt) => {
            if (err) {
                viewmodel.err = "tekne kaydedilemedi: error: " + JSON.stringfy(err);
            } else {
                viewmodel.err = "tekne başarıyla kaydedildi.";
            }
        });

        res.redirect("/tekne/liste");
    };
}

module.exports = router;