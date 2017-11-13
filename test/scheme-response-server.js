var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });

var db = {
    "123": { allowed: true,  "name": "Charlie"  },
    "321": { allowed: false, "name": "Old Gregg"}
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
    if (db[decoded.id].allowed) {
        return {valid: true};
    }
    else {
        return {valid: false};
    }
};

var home = function(req, h) {
    return 'Hai!';
};

var privado = function(req, h) {
    return 'worked';
};

var sendToken = function(req, h) {
    return req.auth.token;
};

var responseFunction = function(req, h) {
    var error = null;
    if(req.headers.error === 'true') {
        throw new Error('failed');
    } else {
        req.response.header('Authorization', 'from scheme response function');
    }
}

const init = async() => {

    await server.register(require('../'));

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

};

init();

module.exports = server;
