const Hapi   = require('@hapi/hapi');
const secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
const server = new Hapi.server({ debug: false });

const db = {
  "123": { allowed: true,  "name": "Charlie"  },
  "321": { allowed: false, "name": "Old Gregg"}
};

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
const validate = async function (decoded, request) {
  if (db[decoded.id].allowed) {
    return {isValid: true};
  }
  else {
    return {isValid: false};
  }
};

const privado = function(req, h) {
  return 'worked';
};

const init = async () =>{
  try {
    await server.register(require('../'));
    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      attemptToExtractTokenInPayload: true,
    });

    server.auth.strategy('jwt-nopayload', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      payloadKey: false,
      attemptToExtractTokenInPayload: true,
    });

    server.auth.strategy('jwt-nopayload2', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      payloadKey: '',
      attemptToExtractTokenInPayload: true,
    });

    server.route([
      { method: 'POST', path: '/privado', handler: privado, config: { auth: { strategies: ['jwt'], payload: 'optional' } } },
      { method: 'POST', path: '/privadonopayload', handler: privado, config: { auth: { strategies: ['jwt-nopayload'], payload: 'optional' } } },
      { method: 'POST', path: '/privadonopayload2', handler: privado, config: { auth: { strategies: ['jwt-nopayload2'], payload: 'optional' } } },
    ]);
  } catch(e) {
    throw e;
  }
}
init();

process.on('unhandledRejection', function(reason, p){
  console.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
});

module.exports = server;
