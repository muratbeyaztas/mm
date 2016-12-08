// 'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    path = require('path'),
    favicon = require('serve-favicon'),
    appsettings = require("./appsettings.json"),
    sessions = require("client-sessions"),
    mongoose = require('mongoose');


var eventManager = require('./managers/event-manager'),
    boatManagr = require('./managers/boat-manager'),
    userManager = require('./managers/user-manager'),
    urlManager = require('./managers/url-manager'),
    trackerManager = require('./managers/tracker-manager'),
    sessionManger = require('./managers/session-manager'),
    databaseManager = require('./managers/database-manager');

var app = express(),
    port = appsettings.environment.port,
    host = appsettings.environment.host;


// view engine setup
app.use(favicon(__dirname + '/public/favicon.ico')); // uncomment after placing your favicon in /public
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.locals.pretty = true; //block html minifier. In prod remove comment this.

app.use(sessionManger.init);
app.use(trackerManager);
app.use(urlManager);
app.use(userManager.authenticate);


app.use('/tekne', boatManagr);
app.use('/giris', userManager.router);
app.use(['/', '/etkinlik'], eventManager);


app.use(function(err, req, res, next) {

    res.status(err.status || 500);
    res.render('./error/500', { error: err });
});

app.listen(port, host, function(error) {
    if (error) {
        console.log(error);
    }
    console.log('running server on ' + host + ' on port ' + port);
});