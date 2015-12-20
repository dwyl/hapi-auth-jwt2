var test   = require('tape');
var Hapi   = require('hapi');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

test('Should fail with 501 when no validateFunc or verifyFunc is registered', function (t) {

  var server = new Hapi.Server();
  server.connection();

  server.register(require('../lib'), function (err) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin without validateFunc or customVerify');

    server.auth.strategy('jwt', 'jwt', {
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
      headers: { Authorization: JWT.sign({id: 138, name: 'Test'}, secret) }
    };

    server.inject(options, function (response) {
      t.equal(response.statusCode, 501, '501 when no validateFunc or verifyFunc set.');
      t.end();
    });
  });
});
