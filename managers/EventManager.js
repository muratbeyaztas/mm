
var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://localhost:27017/mustafa';


router.get('/', function(req, res){


	res.redirect('index.html');
});


router.post('/kaydet',function(req,res){

	var event = {
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

	mongoClient.connect(mongoConString,function(err,db){

		if(!err){

			var eventCollection = db.collection("Events");
			eventCollection.insert(event, function(err,result){

				if(err){
					res.send("event kaydedilemedi");
				}else{
					res.send("event başarıyla kaydedild");
				}
			});

			db.close();
		}
		else{
			res.send("mongodb ye bağlanamadı");
		}
	});

});

module.exports = router;