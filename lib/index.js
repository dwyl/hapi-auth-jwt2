var Boom      = require('boom'); // error handling https://github.com/hapijs/boom
var Hoek      = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var JWT       = require('jsonwebtoken'); // https://github.com/docdis/learn-json-web-tokens
var extract   = require('./extract');    // extract token from Auth Header, URL or Coookie
var pkg       = require('../package.json');
var internals = {}; // Declare internals >> see: http://hapijs.com/styleguide

exports.register = function (server, options, next) {
  server.auth.scheme('jwt', internals.implementation);
  next();
};

exports.register.attributes = { // hapi requires attributes for a plugin.
  pkg: pkg                      // See: http://hapijs.com/tutorials/plugins
};

internals.isFunction = function (functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

internals.implementation = function (server, options) {
  Hoek.assert(options, 'options are required for jwt auth scheme'); // pre-auth checks
  Hoek.assert(options.key, 'options must contain secret key or key lookup function'); // no signing key
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function');

  return {
    authenticate: function (request, reply) {
      var token = extract(request, reply);
      var keyFunc = (internals.isFunction(options.key)) ? options.key : function (decoded, callback) { callback(null, options.key); };
      keyFunc(JWT.decode(token), function (err, key, extraInfo) {
        if (err) {
          return reply(Boom.wrap(err));
        }
        if (extraInfo) {
          request.plugins[pkg.name] = { extraInfo: extraInfo };
        }
        var verifyOptions = options.verifyOptions || {};
        JWT.verify(token, key, verifyOptions, function (err, decoded) {
          if (err && err.name === 'TokenExpiredError') {
            return reply(Boom.unauthorized('Token expired', 'Token'), null, { credentials: null });
          }
          else if (err) {
            return reply(Boom.unauthorized('Invalid token', 'Token'), null, { credentials: null });
          }
          else { // see: http://hapijs.com/tutorials/auth for validateFunc signature
            options.validateFunc(decoded, request, function (err, valid, credentials) { // bring your own checks
              if (err) {
                return reply(Boom.unauthorized('Invalid token', 'Token'), null, err)
              }
              else if (!valid) {
                return reply(Boom.unauthorized('Invalid credentials', 'Token'), null, { credentials: credentials || decoded });
              }
              else {
                return reply.continue({ credentials: credentials || decoded });
              }
            });
          }
        });
      });
    }
  };
};
