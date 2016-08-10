
var session = require('client-sessions'),
    express = require('express'),
    router = express.Router(),
    mongoClient = require('mongodb').MongoClient,
    storeManager = require('./storeManager'),
    app = express();

var userCollectionName = "users",
    loginPageName = "./login.jade";


//models begin
function loginViewModel(error) {
    this.error = error;
}
//models end

// app.use(authenticate);
router.use('/', login);

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
    //console.log(req.url);
    var viewmodel = new loginViewModel();
    var username = req.body.username,
        password = req.body.password;

    if (!username && !password) {
        return res.redirect('/giris');
    }

    mongoClient.connect(storeManager.mongoConString, function (err, db) {

        if (!db) {
            return res.redirect('/giris?mc=0x0');
        }

        users = db.collection(userCollectionName);
        users.findOne({ username: username, password: password }, function (err, result) {

            if (!result) {
                return res.redirect('/giris?mc=0x1');
            }

            if (username == result.username && password == result.password) {
                req.session.user = result;
            }
            else {
                req.session.reset();
            }
        });

        next();
    });
}


module.exports = { router: router, authenticate: authenticate };