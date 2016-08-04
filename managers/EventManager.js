
var express = require('express'),
	router = express.Router(),
	mongoClient = require('mongodb').MongoClient,
	dateFormat = require('dateformat'),
	storeManager = require('./storeManager');

var eventCollectionName = "Events";
var layoutPageName = "./layout";

var viewModel = {
	error: '',
	dateTime: dateFormat(Date.now(), "yyyy-mm-dd"),
	events: {
		success: 1,
		results: []
	}
};


router.get('/', function (req, res) {

	mongoClient.connect(storeManager.mongoConString, function (err, db) {

		if (err) {
			viewModel.error = "database bağlanılamadı";
		}
		else {
			var eventCollection = db.collection(eventCollectionName);
			var cursor = eventCollection.find().sort({ "startDate": -1 });

			cursor.each(function (err, event) {
				viewModel.events.results.push(convertToClientEventModel(event));
			});
		}

		if (db) {
			db.close();
		}
		res.render(layoutPageName, { model: viewModel });
	});

	// res.redirect('index.html');
});

router.post('/kaydet', function (req, res) {

	var eventModel = {
		bootType: req.body.bootType,
		subject: req.body.eventSubject,
		startDate: req.body.startDate,
		startTime: req.body.startTime,
		personCount: req.body.guestCount,
		startLocation: req.body.startLocation,
		endLocation: req.body.endLocation,
		payment: req.body.payment,
		description: req.body.eventDescription,
		hasMeail: req.body.hasMeal
	};

	mongoClient.connect(storeManager.mongoConString, function (err, db) {

		if (!err) {

			var eventCollection = db.collection(eventCollectionName);
			eventCollection.insert(eventModel, function (err, result) {

				if (err) {
					res.send("event kaydedilemedi");
				} else {
					res.send("event başarıyla kaydedild");
				}
			});

			db.close();
		}
		else {
			res.send("mongodb ye bağlanamadı");
		}
	});

});

function convertToClientEventModel(event) {

	var clientEventModel = {
		id: '',
		title: '',
		url: '',
		class: '',
		start: '',
		end: ''
	};
	if (event) {
		var clientEventModel = {
			id: event._id.toString(),
			title: event.subject,
			url: '',
			class: 'event-important',
			start: new Date(event.startDate).getTime(), // Milliseconds
			end: new Date().setDate(new Date(event.startDate).getTime() + 1) // Milliseconds
		};
	}
	return clientEventModel;
};


module.exports = router;