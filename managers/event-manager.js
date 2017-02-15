var express = require('express'),
    dateFormat = require('dateformat'),
    databaseManager = require('./database-manager'),
    mongoose = require('mongoose');


var eventCollectionName = "events",
    layoutPageName = "./layout",
    boatColletionName = "boats",
    eventDetailPageName = "./event/eventDetail",
    router = express.Router();

function getEventsViewModel(success, result) {
    this.success = success || '1';
    this.result = result || [];
}

function eventViewModel(boats) {
    this.boats = boats || [];
}


//event/save  kaydet
//event/delete  sıl
//event/list eventler
//event/update 
//event/get  detay
router.post('/kaydet', saveEvent);
router.get('/eventler', getEventsByRange);
router.get('/detay/:id', getEventDetail);
router.get('/sil/:id', deleteEvent);
router.post('/update/', eventUpdate);
router.use('/', getEvents);

function eventUpdate(req, res) {

    var eventModel = databaseManager.getEventModel();
    eventModel.findById(req.body.id, function (err, etkinlik) {

        etkinlik.boatId = req.body.boatName;
        etkinlik.subject = req.body.subject;
        etkinlik.description = req.body.description;
        etkinlik.startDate = new Date(req.body.startDateTime);
        etkinlik.startTime = req.body.startTime;
        etkinlik.endTime = req.body.endTime;
        etkinlik.personCount = req.body.personCount;
        etkinlik.startLocation = req.body.startLocation;
        etkinlik.endLocation = req.body.endLocation;
        etkinlik.fee = req.body.fee;
        etkinlik.sell = req.body.sell;
        etkinlik.earnestMoney = req.body.earnestMoney;
        etkinlik.moneyType1 = req.body.moneyType1;
        etkinlik.moneyType2 = req.body.moneyType2;
        etkinlik.moneyType3 = req.body.moneyType3;
        etkinlik.hasDinner = req.body.hasDinner === 'evet';

        etkinlik.save(function (err, updatedEtkinlik) {

            res.render(eventDetailPageName, { model: updatedEtkinlik, user: req.authenticated.user });
        });
    });
}

function deleteEvent(req, res) {
    var eventId = req.params.id;
    var evnts = databaseManager.getEventModel();
    evnts.remove({ "_id": new mongoose.Types.ObjectId(eventId) }, function (err, result) {
        res.redirect("/etkinlik");
    });
};

function getEventDetail(req, res) {

    var eventid = req.params.id;
    var evnts = databaseManager.getEventModel();
    evnts.findOne({ _id: new mongoose.Types.ObjectId(eventid) }, function (err, doc) {

        doc.startDateTime = dateFormat(doc.startDate, 'dd-mm-yyyy HH:MM:ss').toString();
        //doc.startDateTime = dateFormat(doc.startDate.setTime(doc.startDate.getTime() + 1 * 86400000), 'dd-mm-yyyy HH:MM:ss').toString();
        console.log(doc.startDateTime);
        doc.startDateTime = doc.startDateTime.split(/ /g)[0];

        var boats = databaseManager.getBoatModel();
        boats.findOne({ _id: new mongoose.Types.ObjectId(doc.boatId) }, function (err, boat) {
            doc.boatName = boat.name;
            res.render(eventDetailPageName, { model: doc, user: req.authenticated.user });
        });
    });
};

function getEventsByRange(req, res) {

    var calenderEvents = new getEventsViewModel();
    var frm = req.query.from,
        to = req.query.to;

    frm = new Date(parseInt(frm));
    to = new Date(parseInt(to));
    calenderEvents.success = 0;

    var evnts = databaseManager.getEventModel();
    evnts.find({ startDate: { $gt: frm, $lt: to } }).sort({ startDate: -1 }).exec(function (err, results) {

        results.forEach(function (evnt) {

            calenderEvents.result.push({
                id: evnt._id.toString(),
                title: evnt.subject,
                url: '/detay/' + evnt._id,
                class: "event-important",
                start: new Date(evnt.startDate.getTime() + evnt.startTime * 60 * 60 * 1000).getTime() - 180 * 60 * 1000,
                end: new Date(evnt.startDate.getTime() + evnt.endTime * 60 * 60 * 1000).getTime() - 180 * 60 * 1000
            });
        });

        calenderEvents.success = 1;
        res.send(calenderEvents);
    });
}

function getEvents(req, res) {

    var viewmodel = new eventViewModel();
    var boats = databaseManager.getBoatModel();
    boats.find({}, function (err, boats) {

        viewmodel.boats = boats;
        return res.render(layoutPageName, { model: viewmodel/*, user: req.authenticated.user*/ });
    });
}





function saveEvent(req, res) {

    var eventModel = databaseManager.getEventModel();
    var newEvent = new eventModel();
    newEvent.boatId = req.body.bootType;
    newEvent.subject = req.body.eventSubject;
    newEvent.description = req.body.eventDescription;
    newEvent.startDate = new Date(req.body.startDate);
    newEvent.startTime = req.body.startTime;
    newEvent.endTime = req.body.endTime;
    newEvent.personCount = req.body.guestCount;
    newEvent.startLocation = req.body.startLocation;
    newEvent.endLocation = req.body.endLocation;
    newEvent.fee = req.body.payment;
    newEvent.sell = req.body.sale;
    newEvent.earnestMoney = req.body.earnestMoney;
    newEvent.moneyType1 = req.body.moneyType1;
    newEvent.moneyType2 = req.body.moneyType2;
    newEvent.moneyType3 = req.body.moneyType3;
    newEvent.hasDinner = req.body.hasMeal === 'on';
    newEvent.save(function (err, evnt) {
        res.redirect("/");
    });
}

module.exports = router;