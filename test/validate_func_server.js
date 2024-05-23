const Boom = require('@hapi/boom');
const Hapi = require('@hapi/hapi');
const secret = 'NeverShareYourSecret';

// for debug options see: https://hapi.dev/tutorials/logging/
let debug;
// debug = { debug: { 'request': ['error', 'uncaught'] } };
debug = { debug: false };
const server = new Hapi.server(debug);

const init = async () => {
  await server.register(require('../'));

  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validate: function (decoded, request, h) {
      if (decoded.id === 138) {
        throw new Error('ASPLODE');
      }
      if (decoded.id === 139) {
        return { isValid: false };
      }
      if (decoded.id === 140) {
        return { isValid: false, errorMessage: 'Bad ID' };
      }
      if (decoded.id === 141) {
        throw Boom.notFound('Resource not found');
      }
      return { response: h.redirect('https://dwyl.com') };
    },
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.route({
    method: 'POST',
    path: '/privado',
    handler: function (req, h) {
      return 'PRIVADO';
    },
    config: { auth: 'jwt' },
  });
};

init();

module.exports = server;
