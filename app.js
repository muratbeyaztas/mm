// 'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	path = require('path'),
	mongodb = require('mongodb'),
	favicon = require('serve-favicon'),
	appsettings = require("./appsettings.json");


var eventManager = require('./managers/eventManager'),
	boatManagr = require('./managers/boatManager'),
	storeData = require('./managers/storeManager'),
	userManager = require('./managers/userManager');

var app = express(),
	port = 5000,
	mongoClient = mongodb.MongoClient;

storeData.mongoConString = appsettings.connectionStrings.mongoDev;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(favicon(__dirname + '/public/favicon.ico')); // uncomment after placing your favicon in /public
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true; //block html minifier. In prod remove comment this.

app.use(function(req, res, next) {
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
        var query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});

app.use(userManager.authenticate);

app.use(['/', '/etkinlik'],eventManager);
app.use('/tekne',boatManagr);
app.use('/giris', userManager.router);

app.listen(port, function(error){
	if(error){
		console.log(error);
	}
	console.log('running server on port ' + port);
});