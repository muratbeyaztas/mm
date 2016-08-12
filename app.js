// 'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	path = require('path'),
	mongodb = require('mongodb'),
	favicon = require('serve-favicon'),
	appsettings = require("./appsettings.json"),
	sessions = require("client-sessions");


var eventManager = require('./managers/event-manager'),
	boatManagr = require('./managers/boat-manager'),
	userManager = require('./managers/user-manager'),
	urlManager = require('./managers/url-manager'),
	databaseManager = require('./managers/database-manager');
	trackerManager = require('./managers/tracker-manager');

var app = express(),
	port = appsettings.environment.port,
	host = appsettings.environment.host,
	mongoClient = mongodb.MongoClient;

mongoClient.connect(appsettings.connectionStrings.mongoDev, function(err, db){
	app.locals.db = db;
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(favicon(__dirname + '/public/favicon.ico')); // uncomment after placing your favicon in /public
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true; //block html minifier. In prod remove comment this.

// app.use(databaseManager.init);
app.use(sessions({
	duration: 1 * 60 * 1000, // how long the session will stay valid in ms
	cookieName: appsettings.cookies.name, // cookie name dictates the key name added to the request object
	secret: appsettings.cookies.secret, // should be a large unguessable string
	// duration: 1 * 60 * 1000, // how long the session will stay valid in ms
	// activeDuration: 1 * 60 * 1000, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds,
	cookie: {
		// path: '/api', // cookie will only be sent to requests under '/api'
		// maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
		// ephemeral: true, // when true, cookie expires when the browser closes
		httpOnly: true, // when true, cookie is not accessible from javascript
		// secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
	}
}));

app.use(trackerManager);
app.use(urlManager);
app.use(userManager.authenticate);



app.use('/tekne', boatManagr);
app.use('/giris', userManager.router);
app.use(['/', '/etkinlik'], eventManager);


app.use(function(err, req, res, next){

  res.status(err.status || 500);
  res.render('./error/500', { error: err });
});

app.listen(port, host, function (error) {
	if (error) {
		console.log(error);
	}
	console.log('running server on '+ host +' on port ' + port);
});