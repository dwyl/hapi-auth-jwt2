var Hapi = require('hapi');
var Boom = require('boom');

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });
server.connection();

var multiTenantSecretKeys = {
  dunderMifflin: ['michaelscott', 'jimhalpert'],
  wernhamHogg: ['davidbrent', 'garethkeenan']
};

var db = {
  "123": { allowed: true,  "name": "Charlie"   },
  "321": { allowed: false, "name": "Old Gregg" }
};

var keyFunc = function (decoded, callback) {
  if (decoded.tenant) {
    var keys = multiTenantSecretKeys[decoded.tenant];

    if (keys) {
      return callback(null, keys, { additional: 'something extra here if needed' });
    }
    else {
      return callback(Boom.unauthorized('Key not found'));
    }
  }
  else {
    return callback(Boom.badRequest('Tenant was not specified in token payload'));
  }
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request, callback) {
  if (db[decoded.id].allowed) {
    var credentials = decoded;

    if (request.plugins['hapi-auth-jwt2']) {
      credentials.extraInfo = request.plugins['hapi-auth-jwt2'].extraInfo;
    }

    return callback(null, true, credentials);
  }
  else {
    return callback(null, false);
  }
};

var home = function(req, reply) {
  return reply('Hai!');
};

var privado = function(req, reply) {
  var data = (req.auth.credentials.extraInfo) ? req.auth.credentials.extraInfo : null;

  return reply({
    message: 'success',
    data: data
  });
};

server.register(require('../'), function () {

  server.auth.strategy('jwt', 'jwt', { key: keyFunc, validateFunc: validate });

  server.route([
    { method: 'GET',  path: '/', handler: home, config: { auth: false } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } }
  ]);

});

module.exports = server;
