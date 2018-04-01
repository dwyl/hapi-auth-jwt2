const Hapi   = require('hapi');
const secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
const server = new Hapi.Server({ debug: false });

const db = {
    "123": { allowed: true,  "name": "Charlie"  },
    "321": { allowed: false, "name": "Old Gregg"}
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
const validate = function (decoded, request, callback) {
    if (db[decoded.id].allowed) {
        return {isValid: true};
    }
    else {
        return {isValid: false};
    }
};

const home = function(req, h) {
    return 'Hai!';
};

const privado = function(req, h) {
    return 'worked';
};

const sendToken = function(req, h) {
    return req.auth.token;
};

const responseFunction = function(req, h) {
    const error = null;
    if(req.headers.error === 'true') {
        throw new Error('failed');
    } else {
        req.response.header('Authorization', 'from scheme response function');
    }
}

const responseAsyncFunction = async function(req, h) {
    await new Promise(resolve => setTimeout(() => resolve(), 200));
    if(req.headers.error === 'true') {
        throw new Error('async failed');
    } else {
        req.response.header('Authorization', 'from scheme response function');
    }
}

const init = async() => {

    await server.register(require('../'));

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validate,
        verifyOptions: {
            algorithms: [ 'HS256' ]
        }, // only allow HS256 algorithm
        responseFunc: responseFunction
    });

    server.auth.strategy('asyncJwt', 'jwt', {
        key: secret,
        validate,
        verifyOptions: {
            algorithms: [ 'HS256' ]
        }, // only allow HS256 algorithm
        responseFunc: responseAsyncFunction
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
        },
        {
            method: 'POST',
            path: '/async',
            handler: sendToken,
            config: {
                auth: 'asyncJwt'
            }
        },
    ]);

};

init();

module.exports = server;
