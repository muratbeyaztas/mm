// 'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	path = require('path'),
	mongodb = require('mongodb'),
	favicon = require('serve-favicon'),
	appsettings = require("./appsettings.json"),
	sessions = require("client-sessions");


var eventManager = require('./managers/eventManager'),
	boatManagr = require('./managers/boatManager'),
	storeData = require('./managers/storeManager'),
	userManager = require('./managers/userManager'),
	urlManager = require('./managers/urlManager');

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

app.use(sessions({
	cookieName: 'authenticated', // cookie name dictates the key name added to the request object
	secret: 'asd45asd2sdalk', // should be a large unguessable string
	duration: 1 * 60 * 1000, // how long the session will stay valid in ms
	activeDuration: 1 * 60 * 1000, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds,
	cookie: {
		// path: '/api', // cookie will only be sent to requests under '/api'
		// maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
		ephemeral: true, // when true, cookie expires when the browser closes
		httpOnly: true, // when true, cookie is not accessible from javascript
		// secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
	}
}));
app.use(urlManager);
app.use(userManager.authenticate);


app.use('/tekne', boatManagr);
app.use('/giris', userManager.router);
app.use(['/', '/etkinlik'], eventManager);

app.listen(port, function (error) {
	if (error) {
		console.log(error);
	}
	console.log('running server on port ' + port);
});