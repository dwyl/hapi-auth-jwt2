var test   = require('tape');
var Hapi   = require('hapi');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

test('Auth mode \'try\' should not set isAuthenticated to true when no token sent', function (t) {
  t.plan(3);

  var server = new Hapi.Server({ debug: {"request": ["error", "uncaught"]} });
  server.connection();

  server.register(require('../'), function (err) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');

    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validateFunc: function (decoded, request, callback) {
        return callback();
      },
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'GET',
      path: '/try',
      handler: function (request, reply) {
        // console.log(' - - - - - - - - - - - - - - - - - - - - - - -')
        // console.log(request.auth);
        // console.log(' - - - - - - - - - - - - - - - - - - - - - - -')
        t.notOk(request.auth.isAuthenticated, 'isAuthenticated is false')
        reply('TRY');
      },
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        }
      }
    });

    var options = {method: 'GET', url: '/try'};

    server.inject(options, function (response) {
      t.equal(response.statusCode, 200, 'Server returned HTTP 200');
      t.end();
    });
  });
});

test('Auth mode \'optional\' should not set isAuthenticated to true when no token sent', function (t) {
  t.plan(3);

  var server = new Hapi.Server();
  server.connection();

  server.register(require('../'), function (err) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');

    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validateFunc: function (decoded, request, callback) {
        return callback();
      },
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'GET',
      path: '/optional',
      handler: function (request, reply) {
        t.notOk(request.auth.isAuthenticated, 'isAuthenticated is false')
        reply('OPTIONAL');
      },
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'optional'
        }
      }
    });

    var options = {method: 'GET', url: '/optional'};

    server.inject(options, function (response) {
      t.equal(response.statusCode, 200, 'Server returned HTTP 200');
      t.end();
    });
  });
});
