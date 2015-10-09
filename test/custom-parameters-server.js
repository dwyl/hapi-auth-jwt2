var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });
server.connection();

var db = {
  "123": { allowed: true,  "name": "Charlie" },
  "321": { allowed: false, "name": "Old Gregg" }
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
  return db[decoded.id].allowed ? callback(null, true) : callback(null, false);
};

var home = function(req, reply) {
  return reply('Hai!');
};

var privado = function(req, reply) {
  return reply('worked');
};

server.register(require('../'), function () {

  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] },
    urlKey: 'customUrlKey', // This is really what we are testing here
    cookieKey: 'customCookieKey',  // idem
    tokenType: 'MyAuthScheme'
  });

  server.route([
    { method: 'GET',  path: '/', handler: home, config: { auth: false } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } },
    { method: 'POST', path: '/required', handler: privado, config: { auth: { mode: 'required', strategy: 'jwt' } } },
    { method: 'POST', path: '/optional', handler: privado, config: { auth: { mode: 'optional', strategy: 'jwt' } } },
    { method: 'POST', path: '/try', handler: privado, config: { auth: { mode: 'try', strategy: 'jwt' } } }
  ]);

});

module.exports = server;
