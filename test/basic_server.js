const Hapi   = require('@hapi/hapi');
const secret = 'NeverShareYourSecret';

// for debug options see: http://hapijs.com/tutorials/logging
const server = new Hapi.server({ debug: false });

const db = {
  "123": { allowed: true,  "name": "Charlie"  },
  "321": { allowed: false, "name": "Old Gregg"}
};

const wait = function(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
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

const home = function(req, h) {
  return 'Hai!';
};

const privado = function(req, h) {
  return 'worked';
};

const sendToken = function(req, h) {
  return req.auth.token;
};

const sendArtifacts = function(req, h) {
  return req.auth.artifacts;
};

const longRunning = async function(req, h) {
  await wait(1100);
  try {
    await server.auth.verify(req);
  } catch (err) {
    if (err.message === 'jwt expired') {
      return 'Verification failed because token expired';
    }
    return 'Verification failed with unexpected error';
  }
  return 'Verification passed';
};

const init = async () =>{
  try {
    await server.register(require('../'));
    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] } // only allow HS256 algorithm
    });

    server.auth.strategy('jwt-nourl', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      urlKey: false
    });

    server.auth.strategy('jwt-nocookie', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      cookieKey: false
    });

    server.auth.strategy('jwt-nourl2', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      urlKey: ''
    });

    server.auth.strategy('jwt-nocookie2', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms: [ 'HS256' ] }, // only allow HS256 algorithm
      cookieKey: ''
    });

    server.auth.strategy('jwt-headless', 'jwt', {
      key: secret,
      validate,
      verifyOptions: { algorithms : ['HS256'] },
      headless: { alg: 'HS256', typ: 'JWT' }
    });

    server.route([
      { method: 'GET', path: '/', handler: home, config: { auth: false } },
      { method: 'GET', path: '/token', handler: sendToken, config: { auth: 'jwt' } },
      { method: 'GET', path: '/artifacts', handler: sendArtifacts, config: { auth:  'jwt' } },
      { method: 'POST', path: '/privado', handler: privado, config: { auth: 'jwt' } },
      { method: 'POST', path: '/privadonourl', handler: privado, config: { auth: 'jwt-nourl' } },
      { method: 'POST', path: '/privadonocookie', handler: privado, config: { auth: 'jwt-nocookie' } },
      { method: 'POST', path: '/privadonourl2', handler: privado, config: { auth: 'jwt-nourl2' } },
      { method: 'POST', path: '/privadonocookie2', handler: privado, config: { auth: 'jwt-nocookie2' } },
      { method: 'POST', path: '/required', handler: privado, config: { auth: { mode: 'required', strategy: 'jwt' } } },
      { method: 'POST', path: '/optional', handler: privado, config: { auth: { mode: 'optional', strategy: 'jwt' } } },
      { method: 'POST', path: '/try', handler: privado, config: { auth: { mode: 'try', strategy: 'jwt' } } },
      { method: 'POST', path: '/headless', handler: privado, config: { auth:  'jwt-headless' } },
      { method: 'POST', path: '/long-running', handler: longRunning, config: { auth:  'jwt-headless' } }
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
