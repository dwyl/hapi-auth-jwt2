var Hapi   = require('hapi');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false })
server.connection();

var db = {
  "123" : { allowed: true,  "name":"Charlie"  },
  "321" : { allowed: false, "name":"Old Gregg"}
 }

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
    if (db[decoded.id].allowed) {
      return callback(null, true);
    }
    else {
      return callback('fail', false);
    }
};

var home = function(req, reply) {
    reply('Hai!');
}

var privado = function(req, reply) {
  reply('worked');
}

server.register(require('../'), function (err) {

  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { ignoreExpiration: true }
  });

  server.route([
    { method: 'GET',  path: '/', handler: home, config:{ auth: false } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } },
  ]);

});

module.exports = server;
