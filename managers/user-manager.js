var express = require('express'),
    databaseManager = require('./database-manager'),
    mongoose = require('mongoose'),
    session = require("client-sessions");

var router = express.Router(),
    app = express();

var userCollectionName = "users",
    loginPageName = "./login.jade",
    userPage = "./user/user.jade",
    userPermissionPage = "./user/userPermission.jade";

//models begin
function loginViewModel(error) {
    this.error = error;
}
//models end

router.get('/giris', login);
router.get("/logout", logout);
router.get('/kullanici', getUserList)
router.get('/kullanici/izinler/:userid', getUserPermission);
router.post('/kullanici/Ekle', addUser);
router.post('/kullanici/guncelle', updateUser);
router.post('/kullanici/sil', deleteUser);

function login(req, res) {

    var messageCode = req.query.mc;
    var viewmodel = new loginViewModel();
    switch (messageCode) {
        case "0x0":
            viewmodel.error = "database bağlantısında sorun var!";
            break;
        case "0x1":
            viewmodel.error = "hatalı-kullanıcı-adı-veya-şifre!";
            break;
        default:
            break;
    }

    return res.render(loginPageName, { model: viewmodel });
}

function authenticate(req, res, next) {

    if (req.url === "/giris") {
        return next();
    }
    var viewmodel = new loginViewModel();
    var username = req.body.lgusername,
        password = req.body.lgpassword;

    if (req.authenticated &&
        req.authenticated.user &&
        (!username || username === req.authenticated.user.username)) {
        return next();
    }
    if (!username && !password) {
        return res.redirect('/giris');
    }

    var users = databaseManager.getUserModel();
    users.findOne({ username: username.toLowerCase(), password: password }, function(err, result) {

        if (!result) {
            return res.redirect('/giris?mc=0x1');
        }
        req.authenticated.user = result;
        next();
    });
}

function getUserList(req, res) {

    var usermodel = databaseManager.getUserModel();
    usermodel.find({}, {}, { sort: { _id: -1 } }, (err, users) => {

        var response = {
            data: [],
            resultCode: 0,
            message: 'OK'
        };
        if (err) {
            response.resultCode = -1;
            response.message = "Kullanıcı listesi database den alınamadı - " + err.message;
        } else {
            users.forEach(user => {
                response.data.push({
                    userid: user._id.toString(),
                    username: user.username,
                    createdDate: user.createdDate
                });
            });
        }
        res.render(userPage, { model: response });
    });
}

function deleteUser(req, res) {

    var userid = req.body.userid;
    var usermodel = databaseManager.getUserModel();
    var response = {
        resultCode: 0,
        message: 'OK'
    };
    usermodel.remove({ _id: new mongoose.Types.ObjectId(userid) }, function(err) {
        if (err) {
            response.resultCode = -1;
            response.message = "Kullanıcı silinemedi. " + error.message;
        }
        res.json(response);
    });
}

function updateUser(req, res) {

    var user = {
        userid: req.body.userid,
        username: req.body.username,
        password: req.body.password
    };

    var response = {
        resultCode: 0,
        message: "OK",
        data: []
    }

    if (!user || !user.username || !user.password || !user.userid) {
        response.resultCode = -1;
        response.message = 'Kullanıcı adı, şifre ya da userID alanlarından biri ya da birkaçı boş';
        res.json(response);
    } else {

        var usermodel = databaseManager.getUserModel();
        usermodel.findById(user.userid, function(err, userdoc) {
            userdoc.username = user.username;
            userdoc.password = user.password;

            userdoc.save(function(err, result) {
                if (err) {
                    response.resultCode = -2,
                        response.message = JSON.stringify(err);
                }
                res.json(response);
            });
        });
    }

}

function addUser(req, res) {

    var userModel = databaseManager.getUserModel();
    var newuser = new userModel();
    newuser.username = req.body.username;
    newuser.password = req.body.password;

    var responseModel = {
        message: 'Kullanıcı oluşturuldu.',
        resultCode: 0
    };

    if (!newuser.username || !newuser.password) {
        responseModel.message = "kullanıcı adı ya da şifre alanı boş bırakılamaz";
        responseModel.resultCode = -1;
    }
    if (responseModel.resultCode === 0) {
        newuser.save((err, result) => {

            if (err) {
                responseModel.message = err.message;
                responseModel.resultCode = -2;
            }
            res.json(responseModel);
        });
    } else {
        res.json(responseModel);
    }
}

function getUserPermission(req, res) {

    var userid = req.params.userid;
    var response = {
        resultCode: 0,
        message: "OK",
        data: []
    };

    if (!userid) {
        response.resultCode = -1;
        response.message = "UserID bilgisi boş geldi";
    } else {

        var userpermissionModel = databaseManager.getUserPermissionModel();
        userpermissionModel.find({ userId: new mongoose.Types.ObjectId(userid) }).exec(function(err, userpermissionDocs) {

            if (err) {
                response.resultCode = -2;
                response.message = err.message;
                return res.render(userPermissionPage, { model: response });
            } else if (!userpermissionDocs || userpermissionDocs.length < 1) {
                response.resultCode = -3;
                response.message = "Tanımlı yetkiniz bulunmuyor.";
                return res.render(userPermissionPage, { model: response });
            } else {

                var permissionsModel = databaseManager.getPermissionModel();
                userpermissionDocs.forEach(function(userPermission, i) {

                    permissionsModel.findOne({ _id: userPermission.permissionID }).exec(function(err, permissionDoc) {

                        if (err) {
                            response.resultCode = -4;
                            repsonse.message = "Kullanıcıya tanımlı izin veritabanından alınamadı - " + err.message;
                            return res.render(userPermissionPage, { model: response });
                        } else {
                            response.data.push(permissionDoc);
                        }
                        if (userpermissionDocs.length == i + 1) {
                            return res.render(userPermissionPage, { model: response });
                        }
                    });
                });
            }
        });
    }
}

function logout(req, res, next) {

    req.authenticated.reset();
    res.redirect("/login");
}

module.exports = { router: router, authenticate: authenticate };