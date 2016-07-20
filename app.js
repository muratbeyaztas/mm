var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb'); //lets require/import the mongodb native drivers.

var app = express();
var port = 5000;
var mongoClient = mongodb.MongoClient; //We need to work with "MongoClient" interface in order to connect to a mongodb server.
var url = 'mongodb://localhost:27017/mustafa'; // Connection URL. This is where your mongodb server is running.


app.use(express.static('public'));
app.use(express.static('src/views'));
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// Use connect method to connect to the Server
mongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    // do some work here with the database.

    //Close connection
    db.close();
}
});


app.get('/', function(req, res){
	res.send('Hello World');
});

app.get('/books', function(req, res){
	res.send('Hello Books');
});

app.post('/saveEvent',function(req,res){

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

	mongoClient.connect(url,function(err,db){

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

app.listen(port, function(err){
	console.log('running server on port ' + port);
});
