const test   = require('tape');
const Hapi   = require('hapi');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

const keyDict = { 5678: secret };

const server = new Hapi.Server();
// server.connection();


test('Full token payload (header + payload + signature) is available to key lookup function using completeToken option', async function (t) {

  try {
    await server.register(require('../'));
    server.auth.strategy('jwt', 'jwt', {
      key: function (decoded) {
        const signatureKey = keyDict[decoded.header.x5t]; // Look dynamically for key based on JWT header field
        return { key: signatureKey };
      },
      complete: true,
      validate: function (decoded, request) {
        return { isValid: true };
      },
      verifyOptions: {algorithms: ['HS256']}
    });

    server.route({
      method: 'POST',
      path: '/',
      handler: function (request, h) { return 'Ok'; },
      config: { auth: 'jwt' }
    });

    const options = {
      method: 'POST',
      url: '/',
      headers: {Authorization: JWT.sign({ id: 1234 }, secret, { header: { x5t: 5678 } })} // set custom JWT header field "x5t"
    };

    const response = await server.inject(options);
    t.equal(response.statusCode, 200, 'Server returned 200 status');
    t.end();
  } catch(e) {
    t.ifError(err, 'No error registering hapi-auth-jwt2 plugin');
  }

});


test.onFinish(function () {
  server.stop(function(){});
})
