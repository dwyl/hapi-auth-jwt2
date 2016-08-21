var test   = require('tape');
var Hapi   = require('hapi');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

test('Should respond with 500 series error when validateFunc errs', function (t) {

  var server = new Hapi.Server();
  server.connection();

  server.register(require('../'), function (err) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');

    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validateFunc: function (decoded, request, callback) {
        return callback(new Error('ASPLODE'));
      },
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'POST',
      path: '/privado',
      handler: function (req, reply) { return reply('PRIVADO'); },
      config: { auth: 'jwt' }
    });

    var options = {
      method: 'POST',
      url: '/privado',
      headers: {Authorization: JWT.sign({id: 138, name: 'Test'}, secret)}
    };

    server.inject(options, function (response) {
      t.equal(response.statusCode, 500, 'Server returned 500 for validateFunc error');
      t.end();
    });
  });
});
