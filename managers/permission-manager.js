var express = require('express'),
    databaseManager = require('./database-manager'),
    mongoose = require('mongoose');


function getByUserId(userid, callback) {

    var userpermodel = databaseManager.getUserPermissionModel();
    userpermodel.find({ userId: mongoose.Types.ObjectId(userid) }).exec(function(err, userperdocs) {
        callback(err, userperdocs);
    });
}

function getByPermissionName(name, callback) {

    var permodel = databaseManager.getPermissionModel();
    permodel.findOne({ name: name }).exec(function(err, perdoc) {
        callback(err, perdoc);
    });
}

module.exports = {
    getByUserId: getByUserId,
    getByPermissionName: getByPermissionName
};