var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	path = require('path'),
	mongodb = require('mongodb'),
	favicon = require('serve-favicon');

var eventManager = require('./managers/EventManager'),
	boatManagr = require('./managers/boatManager'),
	storeData = require('./managers/storeManager');

var app = express(),
	port = 5000,
	mongoClient = mongodb.MongoClient,
	mongoConString = 'mongodb://localhost:27017/mustafa';


storeData.mongoConString = mongoConString;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/etkinlikler',eventManager);
app.use('/tekneler',boatManagr);


app.listen(port, function(error){
	if(error){
		console.log(error);
	}
	console.log('running server on port ' + port);
});
