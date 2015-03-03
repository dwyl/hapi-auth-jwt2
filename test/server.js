var Hapi   = require('hapi');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareThisYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false })
server.connection();

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, callback) {

    console.log(decoded);

    if (!decoded.id) { // has no id
      return callback(null, false);
    }

    return callback(null, true);
};

var home = function(req, reply) {
    reply('Hai!');
}

var privado = function(req, reply) {
  reply('worked');
}

server.register(require('../'), function (err) {

  server.auth.strategy('jwt', 'jwt', { key: secret,  validateFunc: validate });

  server.route([
    { method: 'GET',  path: '/', handler: home, config:{ auth: false } },
    // { method: 'POST', path: '/login', handler: login, config:{ auth: false } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } },
    // // { method: 'POST', path: '/optional', handler: privado, config: { auth: { mode: 'optional' } } },
    // { method: 'POST', path: '/logout', handler: tokenHandler, config: { auth: 'jwt' } },
  ]);

});

module.exports = server;
