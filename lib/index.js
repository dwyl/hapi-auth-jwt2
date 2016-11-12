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

internals.isArray = function (functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Array]';
};

internals.implementation = function (server, options) {
  assert(options, 'options are required for jwt auth scheme'); // pre-auth checks
  assert(options.validateFunc || options.verifyFunc,  'validateFunc OR verifyFunc function is required!')

  // allow custom error raising or default to Boom if no errorFunc is defined
  var raiseError = function(errorType, message, scheme, attributes) {
    if (options.errorFunc && internals.isFunction(options.errorFunc)) {
      var errorContext = {
        errorType: errorType,
        message: message,
        scheme: scheme,
        attributes: attributes,
      };
      errorContext = options.errorFunc(errorContext);
      if (errorContext) {
        errorType = errorContext.errorType;
        message = errorContext.message;
        scheme = errorContext.scheme;
        attributes = errorContext.attributes;
      }
    }
    return Boom[errorType](message, scheme, attributes);
  };

  return {
    authenticate: function (request, reply) {

      var token = extract(request, options); // extract token from Header, Cookie or Query param

      var tokenType = options.tokenType || 'Token'; //

      if (!token) {
        return reply(raiseError('unauthorized', null, tokenType));
      }

      if (!extract.isValid(token)) { // quick check for validity of token format
        return reply(raiseError('unauthorized', 'Invalid token format', tokenType));
      } // verification is done later, but we want to avoid decoding if malformed
      request.auth.token = token; // keep encoded JWT available in the request lifecycle
      // otherwise use the same key (String) to validate all JWTs
      var decoded;
      try {
        decoded = JWT.decode(token, { complete: options.complete || false });
      }
      catch(e) { // request should still FAIL if the token does not decode.
        return reply(raiseError('unauthorized', 'Invalid token format', tokenType));
      }

      if(options.key && typeof options.validateFunc === 'function') {
        // if the keyFunc is a function it allows dynamic key lookup see: https://github.com/dwyl/hapi-auth-jwt2/issues/16
        var keyFunc = (internals.isFunction(options.key)) ? options.key : function (decoded, callback) { callback(null, options.key); };

        keyFunc(decoded, function (err, key, extraInfo) {
          if (err) {
            return reply(raiseError('wrap', err));
          }
          if (extraInfo) {
            request.plugins[pkg.name] = { extraInfo: extraInfo };
          }
          var verifyOptions = options.verifyOptions || {};
          var keys = (internals.isArray(key)) ? key : [ key ];
          var keysTried = 0;

          keys.some(function (key) {
            JWT.verify(token, key, verifyOptions, function (err, decoded) {
              if (err) {
                keysTried++;
                if (keysTried >= keys.length) {
                  return reply(raiseError('unauthorized', 'Invalid token', tokenType), null, { credentials: null });
                }
                // There are still other keys that might work
                return false;
              }
              else { // see: http://hapijs.com/tutorials/auth for validateFunc signature
                options.validateFunc(decoded, request, function (err, valid, credentials) { // bring your own checks
                  if (err) {
                    return reply(raiseError('wrap', err));
                  }
                  else if (!valid) {
                    return reply(raiseError('unauthorized', 'Invalid credentials', tokenType), null, { credentials: credentials || decoded });
                  }
                  else {
                    return reply.continue({ credentials: credentials || decoded, artifacts: token });
                  }
                });
              }
            });
          })
        }); // END keyFunc
      } // END check for (secret) key and validateFunc
      else { // see: https://github.com/dwyl/hapi-auth-jwt2/issues/130
        options.verifyFunc(decoded, request, function(err, valid, credentials) {
          if (err) {
            return reply(raiseError('wrap', err));
          }
          else if (!valid) {
            return reply(raiseError('unauthorized', 'Invalid credentials', tokenType), null, { credentials: decoded });
          } else {
            return reply.continue({ credentials: credentials || decoded, artifacts: token });
          }
        });
      }
      // else { // warn the person that the plugin requires either a validateFunc or verifyFunc!
      //   return reply(Boom.notImplemented('please specify a hapi-auth-jwt2 validateFunc or verifyFunc.', 'Token'), null, { credentials: decoded });
      // }
    },
    response: function(request, reply) {
      if(options.responseFunc && typeof options.responseFunc === 'function') {
        options.responseFunc(request, reply, function(err) {
          if (err) {
            return reply(raiseError('wrap', err));
          }
          else {
            reply.continue();
          }
        })
      }
      else {
        reply.continue();
      }
    }
  };
};
