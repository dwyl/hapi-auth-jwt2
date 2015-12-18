var Boom      = require('boom'); // error handling https://github.com/hapijs/boom
var assert    = require('assert');
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
  assert(options, 'options are required for jwt auth scheme'); // pre-auth checks

  return {
    authenticate: function (request, reply) {

      var token = extract(request, options); // extract token from Header, Cookie or Query param

      if (!token) {
        return reply(Boom.unauthorized(null, 'Token'));
      }

      if (!extract.isValid(token)) { // quick check for validity of token format
        return reply(Boom.unauthorized('Invalid token format', 'Token'));
      } // verification is done later, but we want to avoid decoding if malformed

      // if the keyFunc is a function it allows dynamic key lookup see: https://github.com/dwyl/hapi-auth-jwt2/issues/16
      var keyFunc = (internals.isFunction(options.key)) ? options.key : function (decoded, callback) { callback(null, options.key); };
      // otherwise use the same key (String) to validat all JWTs
      var decoded;
      try {
        decoded = JWT.decode(token); // decode is non-io and fast enough to not have to be async
      }
      catch(e) { // request should still FAIL if the token does not decode.
        return reply(Boom.unauthorized('Invalid token format', 'Token'));
      }

      if(options.bypass_verifcation) { // see: https://github.com/dwyl/hapi-auth-jwt2/issues/130
        return reply.continue({ credentials: decoded, artifacts: token });
      } // make token available in request.auth.credentials but skip JWT.verify

      keyFunc(decoded, function (err, key, extraInfo) {
        if (err) {
          return reply(Boom.wrap(err));
        }
        if (extraInfo) {
          request.plugins[pkg.name] = { extraInfo: extraInfo };
        }
        // additional checks
        assert(options.key, 'options must contain secret key or key lookup function'); // no signing key
        assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function');
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
                return reply(Boom.wrap(err));
              }
              else if (!valid) {
                return reply(Boom.unauthorized('Invalid credentials', 'Token'), null, { credentials: credentials || decoded });
              }
              else {
                request.auth.token = token;
                return reply.continue({ credentials: credentials || decoded, artifacts: token });
              }
            });
          }
        });
      });
    }
  };
};
