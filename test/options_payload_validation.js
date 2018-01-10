var test = require('tape');
var Hapi = require('hapi');
var Boom = require('boom');
var JWT = require('jsonwebtoken');

var secret = 'NeverShareYourSecret';

var payload_data = require('./options_payload_validation_data');
var internals = {};

// bring your own validation function
internals.validate = function (decoded, request, callback) {

    return callback(null, true);
};

internals.rolePermissions = function (roleCredentials, entity) {

    var acl = {
        user: ['may be edited by normal user'], // user can only edit own.
        admin: ['may not be edited by normal user, only by admin']
    };

    var hasPermission = acl[roleCredentials].includes(entity);
    return hasPermission;
};

internals.payload = function (request, reply) {

    var hasPermission = internals.rolePermissions(request.auth.credentials.role,
        request.payload.permission);

    if (hasPermission) {

        return reply.continue();
    }

    return reply(Boom.unauthorized('Role may not edit list'));

};

var server = new Hapi.Server();
server.connection();

function handler (request, reply) {
  return reply({ text: 'You used a Token!', payload: request.payload })
}

server.register(require('../'), function (err) {

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validateFunc: internals.validate,
        verifyOptions: { algorithms: ['HS256'] },
        payload: internals.payload
    });

    server.route([
        {
            method: 'GET', path: '/restricted/payloadNotRequired',
            config: {
                auth: {
                  strategies: ['jwt'],
                  payload: false
                }
            },
            handler: handler
        },
        {
            method: 'POST', path: '/restricted/authDependsOnPayload',
            config: {
                auth: {
                    strategies: ['jwt'],
                    payload: true // payload verificaiton is required
                }
            },
            handler: handler
        }
    ]);
});

test('GET /restricted (does not require payload verification)', function (t) {
  server.inject({
      method: 'GET',
      url: '/restricted/payloadNotRequired',
      headers: { authorization: "Bearer " + payload_data.tokens['user'] }
    },
    function (response) {
      t.equal(response.statusCode, 200, "200 OK");
      t.end();
  });
});

test('POST /restricted/authDependsOnPayload granted for user', function (t) {

    server.inject({
        method: 'POST',
        url: '/restricted/authDependsOnPayload',
        headers: {
          'authorization': "Bearer " + payload_data.tokens['user'],
        },
        payload: payload_data.content['normal']

      },
      function (response) {
        t.equal(response.statusCode, 200, "200 OK");
        t.end();
    });

});

test('POST /restricted/authDependsOnPayload granted for admin', function (t) {
  server.inject({
    method: 'POST',
    url: '/restricted/authDependsOnPayload',
    headers: {
        'authorization': "Bearer " + payload_data.tokens['admin'],
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    payload: payload_data.content['important']

  }, function (response) {
    // test for POST request.payload github.com/dwyl/hapi-auth-jwt2/issues/219
    var payload = JSON.parse(response.payload).payload;
    t.deepEqual(payload, payload_data.content.important,
      "request.payload is returned in response.payload.payload as expected");

    t.equal(response.statusCode, 200, "200 OK");
    t.end();
  });
});

test('POST /restricted/authDependsOnPayload 401 as not admin', function (t) {
    server.inject({
      method: 'POST',
      url: '/restricted/authDependsOnPayload',
      headers: {
          'authorization': "Bearer " + payload_data.tokens['user'],
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      payload: payload_data.content['important']

    }, function (response) {
      t.equal(response.statusCode, 401,
        "401 Unauthorized, because payload requires admin");
      t.end();
    });

});
