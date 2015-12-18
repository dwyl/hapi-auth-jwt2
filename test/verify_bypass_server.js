var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: { 'request': ['error', 'uncaught'] } });
server.connection();

var sendToken = function(req, reply) {
  return reply(req.auth.token);
};

var privado = function(req, reply) {

  return reply(req.auth.credentials);
};

server.register(require('../'), function () {

  server.auth.strategy('jwt', 'jwt', {
    bypass_verifcation: true // no validateFunc or key required.
  });

  server.route([
    { method: 'GET',  path: '/', handler: sendToken, config: { auth: false } },
    { method: 'GET', path: '/required', handler: privado, config: { auth: { mode: 'required', strategy: 'jwt' } } },
    { method: 'GET', path: '/optional', handler: privado, config: { auth: { mode: 'optional', strategy: 'jwt' } } },
    { method: 'GET', path: '/try', handler: privado, config: { auth: { mode: 'try', strategy: 'jwt' } } }
  ]);

});

module.exports = server;
