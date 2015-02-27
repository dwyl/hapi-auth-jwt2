// Load modules

var Boom = require('boom');
var Hoek = require('hoek');
var jwt  = require('jsonwebtoken');

// Declare internals >> see: http://hapijs.com/styleguide

var internals = {};

exports.register = function (server, options, next) {

  server.auth.scheme('jwt', internals.implementation);
  next();
};

internals.implementation = function (server, options) {

  Hoek.assert(options, 'JWT auth options not supplied');
  Hoek.assert(options.secret, 'options does not contain secret key');

  var settings = Hoek.clone(options); // make a copy for later see: http://git.io/x0Bm

  var scheme = {
    authenticate: function (request, reply) {

      var req = request.raw.req;
      var auth = req.headers.authorization;
      if (!auth) {
        return reply(Boom.unauthorized(null, 'Token not present'));
      }
      // strip off the pointless "Bearer " label and any whitespace
      var token = auth.replace(/Bearer/gi,'').replace(/ /g,'');

      if(token.split('.').length !== 3) {
        return reply(Boom.badRequest('Invalid Token (JWT) format', 'Token'));
      }

      jwt.verify(token, options.key, function(err, decoded) {
        if (err) {
          return reply(Boom.unauthorized('Invalid Token', 'Token'));
        }

        if (!settings.validateFunc) {
          return reply.continue({ credentials: decoded });
        }

        // see: http://hapijs.com/tutorials/auth for function signature
        settings.validateFunc(decoded, function (err, isValid, credentials) {

          credentials = credentials || null;

          if (err) {
            return reply(err, null, { credentials: credentials });
          }

          if (!isValid) {
            return reply(Boom.unauthorized('Invalid token', 'Token'), null, { credentials: credentials });
          }

          if (!credentials || typeof credentials !== 'object') {

            return reply(Boom.badImplementation('Bad credentials object received for jwt auth validation'), null, { log: { tags: 'credentials' } });
          }

          // Authenticated

          return reply.continue({ credentials: credentials });
        });

      });

    }
  };

  return scheme;
};
