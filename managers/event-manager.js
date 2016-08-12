
var express = require('express'),
	router = express.Router(),
	mongoClient = require('mongodb').MongoClient,
	ObjectId = require('mongodb').ObjectID,
	dateFormat = require('dateformat');

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

router.post('/kaydet', saveEvent);
router.get('/eventler', getEventsByRange);
router.get('/detay/:id', getEventDetail)
router.use('/', getEvents);

function getEventDetail(req, res) {

	var db = req.app.locals.db;
	var eventid = req.params.id;
	db.collection(eventCollectionName).findOne({ _id: new ObjectId(eventid) }, function (err, doc) {

		db.collection(boatColletionName).findOne({ _id: new ObjectId(doc.bootType) }, function (err, docBoat) {
			
			doc.bootType = docBoat.name;
			res.render(eventDetailPageName, { model: doc });
		});
	});
}

function getEventsByRange(req, res) {

	var db = req.app.locals.db;
	var calenderEvents = new getEventsViewModel();
	var from = req.query.from,
		to = req.query.to;

	from = dateFormat(new Date(parseInt(from)), "yyyy-mm-ddTHH:MM:ss");
	to = dateFormat(new Date(parseInt(to)), "yyyy-mm-ddTHH:MM:ss");
	calenderEvents.success = 0;
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

	var db = req.app.locals.db;
	var viewmodel = new eventViewModel();
	var boats = db.collection(boatColletionName);
	boats.find().toArray(function (err, results) {

		viewmodel.boats = results;
		res.render(layoutPageName, { model: viewmodel });
	});
}

function saveEvent(req, res) {

	var db = req.app.locals.db;
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

	var eventCollection = db.collection(eventCollectionName);
	eventCollection.insert(eventModel, function (err, result) {
		res.redirect("/");
	});
}

module.exports = router;