var express = require('express'),
    databaseManager = require('./database-manager'),
    mongoose = require('mongoose'),
    session = require("client-sessions"),
    permissionManager = require("./permission-manager");

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
router.post('/kullanici/updatepermissions', updateUserPermissions);

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

    return res.render(loginPageName, {
        model: viewmodel
    });
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
    users.findOne({
        username: username.toLowerCase(),
        password: password
    }, function(err, result) {

        if (!result) {
            return res.redirect('/giris?mc=0x1');
        }

        req.authenticated.user = result;
        next();
    });
}

function updateUserPermissions(req, res) {

    var response = {
        resultCode: 0,
        message: 'OK',
        data: []
    };
    var userid = req.body.userid;
    var permissions = req.body.permissionIds;

    if (!userid) {
        response.resultCode = -2;
        response.message = "KullanıcıID boş geldi";
        return res.json(response);
    }

    var userpermissionmodel = databaseManager.getUserPermissionModel();
    userpermissionmodel.remove({
        userId: mongoose.Types.ObjectId(userid)
    }, function(err, doc) {

        if (err) {
            response.resultCode = -1;
            response.message = "Kullanıcı yetkileri güncellenemedi - (CNT-DLT)";
            return res.json(response);
        }

        if (!permissions || permissions.length < 1) {
            return res.json(response);
        }

        var counter = 0;
        for (var i = 0; i < permissions.length; i++) {
            var newuserpermission = new userpermissionmodel();
            newuserpermission.byUser = mongoose.Types.ObjectId(req.authenticated.user._id);
            newuserpermission.userId = userid;
            newuserpermission.createdDate = Date.now();
            newuserpermission.permissionID = permissions[i];
            newuserpermission.save(function(err) {
                if (permissions.length == ++counter) {
                    res.json(response);
                }
            });
        }
    });
}

function hasRight(userperdocs, right) {

    for (var i = 0; i < userperdocs.length; i++) {
        if (userperdocs[i].permissionID.toString() === right._id.toString()) {
            return true;
        }
    }
    return false;
}

function getUserList(req, res) {

    var response = {
        data: [],
        resultCode: 0,
        message: 'OK'
    };


    checkUserHasPermission('admin', req.authenticated.user, function(hasPer) {

        if (!hasPer) {
            response.resultCode = -2;
            response.message = "Yetkisiz kullanıcı";
            return res.render(userPage, { model: response });
        }

        var usermodel = databaseManager.getUserModel();
        usermodel.find({}, {}, { sort: { _id: -1 } }, function(err, users) {

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
            res.render(userPage, {
                model: response
            });
        });
    });

}

function checkUserHasPermission(permissionname, user, callback) {
    var currentUser = user;
    if (!currentUser) {
        callback(false);
        return;
    }

    var hasPermission = false;
    permissionManager.getByUserId(currentUser._id.toString(), function(err, userperdocs) {
        permissionManager.getByPermissionName('admin', function(err, adminperdoc) {
            var isTrue = hasRight(userperdocs, adminperdoc);
            callback(isTrue);
        });
    });

}

function deleteUser(req, res) {

    var userid = req.body.userid;
    var usermodel = databaseManager.getUserModel();
    var response = {
        resultCode: 0,
        message: 'OK'
    };
    usermodel.remove({
        _id: new mongoose.Types.ObjectId(userid)
    }, function(err) {
        if (err) {
            response.resultCode = -1;
            response.message = "Kullanıcı silinemedi. " + error.message;
        }

        var userpermissionmodel = databaseManager.getUserPermissionModel();
        userpermissionmodel.remove({
            userId: mongoose.Types.ObjectId(userid)
        }, function() {
            res.json(response);
        });
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
    var userpermssios;

    if (!userid) {
        response.resultCode = -1;
        response.message = "UserID bilgisi boş geldi";
    } else {

        var permissionsModel = databaseManager.getPermissionModel();
        permissionsModel.find({}).exec(function(err, permissionDocs) {

            if (err) {
                response.resultCode = -4;
                response.message = "Kullanıcıya tanımlı izin veritabanından alınamadı - " + err.message;
                return res.render(userPermissionPage, {
                    model: response
                });
            } else {

                var userpermissionmodel = databaseManager.getUserPermissionModel();
                userpermissionmodel.find({
                    userId: new mongoose.Types.ObjectId(userid)
                }).exec(function(err, userpermissionDocs) {

                    if (err) {
                        response.resultCode = -2;
                        response.message = err.message;
                        return res.render(userPermissionPage, {
                            model: response
                        });
                    }

                    for (var a = 0; a < permissionDocs.length; a++) {

                        var permission = permissionDocs[a];
                        var responseDataRow = {
                            permissionid: permission._id,
                            permissionname: permission.name,
                            createdDate: '',
                            ischeck: false
                        };

                        for (var i = 0; i < userpermissionDocs.length; i++) {

                            var userpermission = userpermissionDocs[i];
                            if (userpermission.permissionID.toString() == permission._id.toString()) {
                                responseDataRow.ischeck = true;
                                responseDataRow.createdDate = userpermission.createdDate;
                                break;
                            }
                        }
                        response.data.push(responseDataRow);
                    }
                    res.render(userPermissionPage, {
                        model: response
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

module.exports = {
    router: router,
    authenticate: authenticate
};