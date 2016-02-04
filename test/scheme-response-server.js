var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });
server.connection();

var db = {
    "123": { allowed: true,  "name": "Charlie"  },
    "321": { allowed: false, "name": "Old Gregg"}
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
    if (db[decoded.id].allowed) {
        return callback(null, true);
    }
    else {
        return callback(null, false);
    }
};

var home = function(req, reply) {
    return reply('Hai!');
};

var privado = function(req, reply) {
    return reply('worked');
};

var sendToken = function(req, reply) {
    return reply(req.auth.token);
};

var responseFunction = function(req, reply, callback) {
    var error = null;
    if(req.headers.error === 'true') {
        error = new Error('failed');
    } else {
        req.response.header('Authorization', 'from scheme response function');
    }
    callback(error); //no error
}

server.register(require('../'), function () {

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validateFunc: validate,
        verifyOptions: {
            algorithms: [ 'HS256' ]
        }, // only allow HS256 algorithm
        responseFunc: responseFunction
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: home,
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/token',
            handler: sendToken,
            config: {
                auth: 'jwt'
            }
        },
        {
            method: 'POST',
            path: '/privado',
            handler: privado,
            config: {
                auth: 'jwt'
            }
        },
        {
            method: 'POST',
            path: '/required',
            handler: privado,
            config: {
                auth: {
                    mode: 'required',
                    strategy: 'jwt'
                }
            }
        }
    ]);

});

module.exports = server;
