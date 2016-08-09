
var express = require('express'),
	router = express.Router(),
	mongoClient = require('mongodb').MongoClient,
	ObjectId = require('mongodb').ObjectID,
	dateFormat = require('dateformat'),
	storeManager = require('./storeManager');

var eventCollectionName = "events",
	layoutPageName = "./layout",
	boatColletionName = "boats",
	eventDetailPageName = "./event/eventDetail";

function getEventsViewModel(success, result) {
	this.success = success || '1';
	this.result = result || [];
}

function eventViewModel(boats) {
	this.boats = boats || [];
}

router.use('/', getEvents);
router.use('/kaydet', saveEvent);
router.use('/eventler', getEventsByRange);
router.use('/detay/:id', getEventDetail)

function getEventDetail(req, res) {

	var eventid = req.params.id;
	mongoClient.connect(storeManager.mongoConString, function (err, db) {

		db.collection(eventCollectionName).findOne({ _id: new ObjectId(eventid) }, function (err, doc) {

			db.collection(boatColletionName).findOne({ _id: new ObjectId(doc.bootType) }, function (err, docBoat) {

				doc.bootType = docBoat.name;
				if (db) {
					db.close();
				}
				res.render(eventDetailPageName, { model: doc });
			});
		});
	});
}

function getEventsByRange(req, res) {

	var calenderEvents = new getEventsViewModel();
	var from = req.query.from,
		to = req.query.to;

	from = dateFormat(new Date(parseInt(from)), "yyyy-mm-ddTHH:MM:ss");
	to = dateFormat(new Date(parseInt(to)), "yyyy-mm-ddTHH:MM:ss");

	mongoClient.connect(storeManager.mongoConString, function (err, db) {

		calenderEvents.success = 0;
		if (!err) {
			var eventCollection = db.collection(eventCollectionName);
			var evnts = eventCollection.find({ startDate: { $gt: from, $lt: to } }).sort({ startDate: -1 });

			evnts.each(function (err, evnt) {

				if (!evnt) {
					calenderEvents.success = 1;
					res.send(calenderEvents);
				}
				else {
					calenderEvents.result.push({
						id: evnt._id.toString(),
						title: evnt.description,
						url: '/detay/' + evnt._id,
						class: "event-important",
						start: new Date(evnt.startDate).getTime(),
						end: new Date(evnt.startDate).setDate(new Date(evnt.startDate).getDate() + 1)
					});
				}
			});
		} else {
			res.send("db bağlantısında sorun var");
		}
	});
}

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
			url: '#events-modal',
			class: 'event-important',
			start: new Date(event.startDate).getTime(), // Milliseconds
			end: new Date().setDate(new Date(event.startDate).getTime() + 1) // Milliseconds
		};
	}
	return clientEventModel;
}

function getEvents(req, res) {

	var viewmodel = new eventViewModel();
	mongoClient.connect(storeManager.mongoConString, function (err, db) {

		var boats = db.collection(boatColletionName);
		boats.find().toArray(function (err, results) {

			if (db) {
				db.close();
			}

			viewmodel.boats = results;
			res.render(layoutPageName, { model: viewmodel });
		});
	});
}

function saveEvent(req, res) {

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
		var eventCollection = db.collection(eventCollectionName);
		eventCollection.insert(eventModel, function (err, result) {
			db.close();
			res.redirect("/");
		});
	});
}

module.exports = router;