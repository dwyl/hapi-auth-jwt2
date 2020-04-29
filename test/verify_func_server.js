const Hapi   = require('@hapi/hapi');
const secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
let debug;
// debug = { debug: { 'request': ['error', 'uncaught'] } };
debug = { debug: false };
const server = new Hapi.server(debug);

const sendToken = function(req, h) {
  return req.auth.token || null;
};

const privado = function(req, h) {
  return req.auth.credentials || null;
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
const customVerify = function (decoded, request) {
  if(decoded.error) {
    throw Error('customVerify fails!');
  }
  else if (decoded.some_property) {
    return {isValid: true, credentials: decoded};
  }
  else {
    return { isValid: false };
  }
};
const init = async() => {
  await server.register(require('../'));

  server.auth.strategy('jwt', 'jwt', {
    verify: customVerify // no validate or key required.
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
