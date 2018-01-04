const Hapi   = require('hapi');
const secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
const server = new Hapi.Server({ debug: false });

const db = {
  "123": { allowed: true,  "name": "Charlie" },
  "321": { allowed: false, "name": "Old Gregg" }
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
const validate = function (decoded, request) {
  return { isValid: db[decoded.id].allowed}
};

const home = function(req, reply) {
  return 'Hai!';
};

const privado = function(req, reply) {
  return 'worked';
};
const init = async () => {
  await server.register(require('../'));
  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validate,
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
}
init();

module.exports = server;
