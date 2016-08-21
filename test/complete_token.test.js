var test   = require('tape');
var Hapi   = require('hapi');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var keyDict = { 5678: secret };

var server = new Hapi.Server();
server.connection();


test('Full token payload (header + payload + signature) is available to key lookup function using completeToken option', function (t) {

  server.register(require('../'), function (err) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');

    server.auth.strategy('jwt', 'jwt', {
      key: function (decoded, callback) {
		var signatureKey = keyDict[decoded.header.x5t]; // Look dynamically for key based on JWT header field
        return callback(null, signatureKey);
      },
	  complete: true,
      validateFunc: function (decoded, request, callback) {
        return callback(null, true);
      },
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'POST',
      path: '/',
      handler: function (request, reply) { return reply('Ok'); },
      config: { auth: 'jwt' }
    });

    var options = {
      method: 'POST',
      url: '/',
      headers: {Authorization: JWT.sign({ id: 1234 }, secret, { header: { x5t: 5678 } })} // set custom JWT header field "x5t"
    };

    server.inject(options, function (response) {
      t.equal(response.statusCode, 200, 'Server returned 200 status');
      t.end();
    });
  });
});


test.onFinish(function () {
  server.stop(function(){});
})
