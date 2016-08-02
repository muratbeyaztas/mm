<<<<<<< HEAD
var express = require('express');
var app = express();
var port = 5000;

app.use(express.static('public'));
app.use(express.static('src/views'));

app.get('/', function(req, res){
  res.send('Hello World');
});

app.get('/books', function(req, res){
  res.send('Hello Books');
});

app.listen(port, function(err){
  console.log('running server on port ' + port);
=======
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


app.listen(port, function(err){
	console.log('running server on port ' + port);
>>>>>>> 0135e97bb086f4005ffe989a7658420ef3dff50d
});
