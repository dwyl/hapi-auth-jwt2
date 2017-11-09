var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });

var db = {
  "123": { allowed: true,  "name": "Charlie"   },
  "321": { allowed: false, "name": "Old Gregg" }
};

var scopesDb = {
  "123": ['Admin', 'Authenticated'],
  "321": ['Authenticated']
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request) {

    if (db[decoded.id].allowed) {
      var credentials = db[decoded.id];
      credentials.scope = scopesDb[decoded.id];
      return credentials;
    }
    else {
      return false;
    }
};

var home = function(req, h) {
  return 'Hai!';
};

var privado = function(req, reply) {
  return 'worked';
};
const init = async() => {
  await server.register(require('../'));

  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] } // use HS256 (secure) algorithm
  });

  server.route([
    { method: 'GET',  path: '/', handler: home, config: { auth: false } },
    { method: 'POST', path: '/privado-with-scope', handler: privado, config: { auth: { strategy: 'jwt', scope: [ 'Admin' ] } } }
  ]);

};

init();

module.exports = server;
