
var express = require('express'),
    databaseManager = require('./database-manager');

var router = express.Router(),
    app = express();

var userCollectionName = "users",
    loginPageName = "./login.jade";


//models begin
function loginViewModel(error) {
    this.error = error;
}
//models end

router.get('/', login);

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
    var username = req.body.username,
        password = req.body.password;

    if (req.authenticated && req.authenticated.user) {
        return next();
    }

    if (!username && !password) {
        return res.redirect('/giris');
    }

    var users = databaseManager.getUserModel();
    users.findOne({ username: username.toLowerCase(), password: password }, function (err, result) {

        if (!result) {
            return res.redirect('/giris?mc=0x1');
        }
        req.authenticated.user = result;
        next();
    });
}

module.exports = { router: router, authenticate: authenticate };
