const test   = require('tape');
const Hapi   = require('@hapi/hapi');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

test('Auth mode \'try\' should not set isAuthenticated to true when no token sent', async function (t) {
  t.plan(2);

  const server = new Hapi.server({ debug: {"request": ["error", "uncaught"]} });
  
  try {
    await server.register(require('../'));
  } catch(e) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');
  }
    

    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validate: function (decoded, request) {
      },
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'GET',
      path: '/try',
      handler: function (request, h) {
        // console.log(' - - - - - - - - - - - - - - - - - - - - - - -')
        // console.log(request.auth);
        // console.log(' - - - - - - - - - - - - - - - - - - - - - - -')
        t.notOk(request.auth.isAuthenticated, 'isAuthenticated is false')
        return 'TRY';
      },
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        }
      }
    });

    const options = {method: 'GET', url: '/try'};

    const response = await server.inject(options)
      t.equal(response.statusCode, 200, 'Server returned HTTP 200');
      t.end();
});

test('Auth mode \'optional\' should not set isAuthenticated to true when no token sent', async function (t) {
  t.plan(3);

  const server = new Hapi.server();

  try{
    server.register(require('../'))
  }catch(err) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');
  }
  t.ifError(false, 'No error registering hapi-auth-jwt2 plugin');
    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validate: function (decoded, request) {},
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'GET',
      path: '/optional',
      handler: function (request, h) {
        t.notOk(request.auth.isAuthenticated, 'isAuthenticated is false')
        return 'OPTIONAL';
      },
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'optional'
        }
      }
    });

    const options = {method: 'GET', url: '/optional'};

    const response = await server.inject(options);
      t.equal(response.statusCode, 200, 'Server returned HTTP 200');
      t.end();
});
