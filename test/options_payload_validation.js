var test = require('tape');
var Hapi = require('hapi');
var Boom = require('boom');

var JWT = require('jsonwebtoken');
var _ = require('lodash');

var secret = 'NeverShareYourSecret';


var myvariables = require('./options_payload_validation_data');
var internals = {};

// bring your own validation function
internals.validate = function (decoded, request, callback) {

    return callback(null, true);
};

internals.rolePermissions = function (roleCredentials, entity) {

    var acl = {
        user: ['may be edited by normal user'], // user can only <edit> this content type
        admin: ['may not be edited by normal user, only by admin', 'may be edited by normal user']
        // admin can <edit> both content types
    };

    var hasPermission = _.includes(acl[roleCredentials], entity);
    return hasPermission;
};

internals.payload = function (request, reply) {

    var hasPermission = internals.rolePermissions(request.auth.credentials.role, request.payload.type);

    if (hasPermission) {

        return reply.continue();
    }

    return reply(Boom.unauthorized('Role may not edit list'));

};

var server = new Hapi.Server();
server.connection();

server.register(require('../'), function (err) {

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validateFunc: internals.validate,
        verifyOptions: { algorithms: ['HS256'] },

        payload: internals.payload
    });

    server.route([
        {
            method: "GET", path: "/",
            config: {
                auth: false
            },
            handler: function (request, reply) {
                reply({ text: 'Token not required' });
            }
        },

        {
            method: 'GET', path: '/restricted',
            config: {
                auth: 'jwt'
            },
            handler: function (request, reply) {
                reply({ text: 'You used a Token!' })
                    .header("Authorization", request.headers.authorization);
            }
        },
        {
            method: 'PUT', path: '/restricted/payloadRequired',
            config: {
                auth: {
                    strategies: ['jwt']
                },
            },
            handler: function (request, reply) {
                reply({ text: 'You used a Token!', payload: request.payload })
                    .header("Authorization", request.headers.authorization);
            }
        },
        {
            method: 'PUT', path: '/restricted/payloadRequired/authDependsOnPayload',
            config: {
                auth: {
                    strategies: ['jwt'],
                    payload: "required"
                }
            },
            handler: function (request, reply) {
                reply({ text: 'You used a Token!', payload: request.payload })
                    .header("Authorization", request.headers.authorization);
            }
        }
    ]);

});


test('1', function (t) {



    server.inject(
        {
            method: 'GET',
            url: '/'
        }, function (response) {
            t.equal(response.statusCode, 200, 'Server returned 200 for OK');
            t.end();
        });


    // t.end();



});

test('2', function (t) {


    server.inject(
        {
            method: 'GET',
            url: '/restricted',
            headers: { authorization: "Bearer " + myvariables.tokens['user'] }
        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });


    // t.end();
});

test('3', function (t) {

    server.inject(
        {
            method: 'GET',
            url: '/restricted',
            headers: { authorization: "Bearer " + myvariables.tokens['admin'] }
        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });

});

test('4', function (t) {

    server.inject(
        {
            method: 'PUT',
            url: '/restricted/payloadRequired',
            headers: {
                'authorization': "Bearer " + myvariables.tokens['user'],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: myvariables.content[1]

        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });

});

test('5', function (t) {

    server.inject(
        {
            method: 'PUT',
            url: '/restricted/payloadRequired',
            headers: {
                'authorization': "Bearer " + myvariables.tokens['admin'],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: myvariables.content[1]

        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });

});


test('6', function (t) {

    server.inject(
        {
            method: 'PUT',
            url: '/restricted/payloadRequired/authDependsOnPayload',
            headers: {
                'authorization': "Bearer " + myvariables.tokens['user'],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: myvariables.content['normal']

        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });

});

test('7', function (t) {

    server.inject(
        {
            method: 'PUT',
            url: '/restricted/payloadRequired/authDependsOnPayload',
            headers: {
                'authorization': "Bearer " + myvariables.tokens['admin'],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: myvariables.content['normal']

        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });

});


test('8', function (t) {

    server.inject(
        {
            method: 'PUT',
            url: '/restricted/payloadRequired/authDependsOnPayload',
            headers: {
                'authorization': "Bearer " + myvariables.tokens['user'],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: myvariables.content['important']

        }, function (response) {
            t.equal(response.statusCode, 401, "Unauthorized, because payload requires admin");
            t.end();
        });

});

test('9', function (t) {

    server.inject(
        {
            method: 'PUT',
            url: '/restricted/payloadRequired/authDependsOnPayload',
            headers: {
                'authorization': "Bearer " + myvariables.tokens['admin'],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: myvariables.content['important']

        }, function (response) {
            t.equal(response.statusCode, 200, "Server returned 200 for OK");
            t.end();
        });

});