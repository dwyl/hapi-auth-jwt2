var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var debug;
// debug = { debug: { 'request': ['error', 'uncaught'] } };
debug = { debug: false };
var server = new Hapi.Server(debug);

var sendToken = function(req, h) {
  return req.auth.token || null;
};

var privado = function(req, h) {
  return req.auth.credentials || null;
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var customVerifyFunc = function (decoded, request) {
  if(decoded.error) {
    throw Error('customVerify fails!');
  }
  else if (decoded.some_property) {
    return decoded;
  }
  else {
    return false;
  }
};
const init = async() => {
  await server.register(require('../'));

  server.auth.strategy('jwt', 'jwt', {
    verifyFunc: customVerifyFunc // no validateFunc or key required.
  });

  server.route([
    { method: 'GET',  path: '/', handler: sendToken, config: { auth: false } },
    { method: 'GET', path: '/required', handler: privado, config: { auth: { mode: 'required', strategy: 'jwt' } } },
    { method: 'GET', path: '/optional', handler: privado, config: { auth: { mode: 'optional', strategy: 'jwt' } } },
    { method: 'GET', path: '/try', handler: privado, config: { auth: { mode: 'try', strategy: 'jwt' } } }
  ]);

};

init();

module.exports = server;
