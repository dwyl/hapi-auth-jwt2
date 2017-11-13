var Hapi = require('hapi');
var Boom = require('boom');

// for debug options see: http://hapijs.com/tutorials/logging
var server = new Hapi.Server({ debug: false });

var multiTenantSecretKeys = {
  dunderMifflin: ['michaelscott', 'jimhalpert'],
  wernhamHogg: ['davidbrent', 'garethkeenan']
};

var db = {
  "123": { allowed: true,  "name": "Charlie"   },
  "321": { allowed: false, "name": "Old Gregg" }
};

var keyFunc = function (decoded) {
  if (decoded.tenant) {
    var keys = multiTenantSecretKeys[decoded.tenant];

    if (keys) {
      return {key: keys, additional: 'something extra here if needed' };
    }
    else {
      throw Boom.unauthorized('Key not found');
    }
  }
  else {
    throw Boom.badRequest('Tenant was not specified in token payload');
  }
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, request) {
  if (db[decoded.id].allowed) {
    var credentials = decoded;

    if (request.plugins['hapi-auth-jwt2']) {
      credentials.extraInfo = request.plugins['hapi-auth-jwt2'].extraInfo;
    }

    return {valid: true, credentials};
  }
  else {
    return {valid:false};
  }
};

var home = function(req, h) {
  return 'Hai!';
};

var privado = function(req, h) {
  var data = (req.auth.credentials.extraInfo) ? req.auth.credentials.extraInfo : null;

  return {
    message: 'success',
    data: data
  };
};
const init = async() => {
  await server.register(require('../'));

  server.auth.strategy('jwt', 'jwt', { key: keyFunc, validateFunc: validate });

  server.route([
    { method: 'GET',  path: '/', handler: home, config: { auth: false } },
    { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } }
  ]);

};

init();

module.exports = server;
