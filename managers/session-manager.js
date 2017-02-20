var sessions = require("client-sessions"),
    appsettings = require('../appsettings.json');

var sessionManger = (function() {

    function init(req, res, next) {

        sessions({
            duration: 1 * 60 * 1000, // how long the session will stay valid in ms
            cookieName: appsettings.cookies.name, // cookie name dictates the key name added to the request object
            secret: appsettings.cookies.secret, // should be a large unguessable string
            // duration: 1 * 60 * 1000, // how long the session will stay valid in ms
            // activeDuration: 1 * 60 * 1000, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds,
            cookie: {
                // path: '/api', // cookie will only be sent to requests under '/api'
                maxAge: 0, // duration of the cookie in milliseconds, defaults to duration above
                // ephemeral: true, // when true, cookie expires when the browser closes
                httpOnly: true, // when true, cookie is not accessible from javascript
                // secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
            }
        })(req, res, next);
    }

    return {
        init: init
    }
})();

module.exports = sessionManger;