var Hapi   = require('hapi');
var secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });
server.connection();

var db = {
  "123": { allowed: true,  "name": "Charlie"  },
  "321": { allowed: false, "name": "Old Gregg"}
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
  if (db[decoded.id].allowed) {
    return callback(null, true);
  }
  else {
    return callback(null, false);
  }
};

var home = function(req, reply) {
  return reply('Hai!');
};

var privado = function(req, reply) {
  return reply('worked');
};

var sendToken = function(req, reply) {
  return reply(req.auth.token);
};

server.register(require('../'), function () {

  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] } // only allow HS256 algorithm
  });

  server.auth.strategy('jwt-nourl', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
    urlKey: false
  });

  server.auth.strategy('jwt-nocookie', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
    cookieKey: false
  });

  server.auth.strategy('jwt-nourl2', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
    urlKey: ''
  });

  server.auth.strategy('jwt-nocookie2', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
    cookieKey: ''
  });

  server.route([
    { method: 'GET',  path: '/', handler: home, config: { auth: false } },
    { method: 'GET', path: '/token', handler: sendToken, config: { auth: 'jwt' } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } },
    { method: 'POST', path: '/privadonourl', handler: privado, config: { auth: 'jwt-nourl' } },
    { method: 'POST', path: '/privadonocookie', handler: privado, config: { auth: 'jwt-nocookie' } },
    { method: 'POST', path: '/privadonourl2', handler: privado, config: { auth: 'jwt-nourl2' } },
    { method: 'POST', path: '/privadonocookie2', handler: privado, config: { auth: 'jwt-nocookie2' } },
    { method: 'POST', path: '/required', handler: privado, config: { auth: { mode: 'required', strategy: 'jwt' } } },
    { method: 'POST', path: '/optional', handler: privado, config: { auth: { mode: 'optional', strategy: 'jwt' } } },
    { method: 'POST', path: '/try', handler: privado, config: { auth: { mode: 'try', strategy: 'jwt' } } }
  ]);

});

module.exports = server;
