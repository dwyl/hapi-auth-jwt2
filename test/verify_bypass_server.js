var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: { 'request': ['error', 'uncaught'] } });
server.connection();

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
  // don't need to add anything here
};

// see discussion in https://github.com/dwyl/hapi-auth-jwt2/issues/130
// var bypass_validation = function(decoded, callback) {
//   console.log(' - - - - - - - - - - - - - - - - > hello');
//   console.log(decoded);
//   // console.log(req);
//   // can we simply short-circuit the verification?
//   return reply.continue({ credentials: decoded});
// }

var sendToken = function(req, reply) {
  return reply(req.auth.token);
};

var home = function(req, reply) {
  return reply('Hai!');
};

var privado = function(req, reply) {
  return reply('worked');
};

server.register(require('../'), function () {

  server.auth.strategy('jwt', 'jwt', {
    key: 'bypass_validation',
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] } // only allow HS256 algorithm
  });

  server.route([
    { method: 'GET',  path: '/', handler: home, config: { auth: false } },
    { method: 'GET', path: '/token', handler: sendToken, config: { auth: 'jwt' } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } },
    { method: 'POST', path: '/required', handler: privado, config: { auth: { mode: 'required', strategy: 'jwt' } } },
    { method: 'POST', path: '/optional', handler: privado, config: { auth: { mode: 'optional', strategy: 'jwt' } } },
    { method: 'GET', path: '/try', handler: privado, config: { auth: { mode: 'try', strategy: 'jwt' } } }
  ]);

});

module.exports = server;
