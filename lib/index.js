'use strict';

const Boom = require('boom');           // error handling https://github.com/hapijs/boom
const assert = require('assert');       // use assert to check if options are set
const JWT = require('jsonwebtoken');    // https://github.com/docdis/learn-json-web-tokens
const extract = require('./extract');   // extract token from Auth Header, URL or Coookie
const pkg = require('../package.json'); // use package name and version rom package.json
const internals = {};                   // see: http://hapijs.com/styleguide#module-globals

/**
 * register registers the name and exposes the implementation of the plugin
 * see: http://hapijs.com/api#serverplugins for plugin format
 * @param {Object} server - the hapi server to which we are attaching the plugin
 * @param {Object} options - any options set during plugin registration
 * in this case we are not using the options during register but we do later.
 * @param {Function} next - the callback called once registration succeeds
 * @returns {Function} next - returns (calls) the callback when complete.
 */
exports.plugin = {
  register: function (server, options) {
    server.auth.scheme('jwt', internals.implementation); // hapijs.com/api#serverauthapi
  }
}

/**
 * attributes merely aliases the package.json (re-uses package name & version)
 * simple example: github.com/hapijs/hapi/blob/master/API.md#serverplugins
 */
exports.plugin.pkg = pkg // hapi requires attributes for a plugin.
                         // also see: http://hapijs.com/tutorials/plugins

/**
 * isFunction checks if a given value is a function.
 * @param {Object} functionToCheck - the object we want to confirm is a function
 * @returns {Boolean} - true if the functionToCheck is a function. :-)
 */
internals.isFunction = function (functionToCheck) {
  let getType = {};

  return functionToCheck
    && (getType.toString.call(functionToCheck) === '[object Function]' || getType.toString.call(functionToCheck) === '[object AsyncFunction]');
};

/**
 * implementation is the "main" interface to the plugin and contains all the
 * "implementation details" (methods) such as authenicate, response & raiseError
 * @param {Object} server - the Hapi.js server object we are attaching the
 * the hapi-auth-jwt2 plugin to.
 * @param {Object} options - any configuration options passed in.
 * @returns {Function} authenicate - we return the authenticate method after
 * registering the plugin as that's the method that gets called for each route.
 */
internals.implementation = function (server, options) {
  assert(options, 'options are required for jwt auth scheme'); // pre-auth checks
  assert(options.validate
    || options.verify, 'validate OR verify function is required!');

  // allow custom error raising or default to Boom if no errorFunc is defined
  function raiseError (errorType, message, scheme, attributes) {
    let errorContext = {
      errorType: errorType,
      message: message,
      scheme: scheme,
      attributes: attributes
    };
    let _errorType = errorType;   // copies of params
    let _message = message;       // so we can over-write them below
    let _scheme = scheme;         // without a linter warning
    let _attributes = attributes; // if you know a better way please PR!

    if (options.errorFunc && internals.isFunction(options.errorFunc)) {
      errorContext = options.errorFunc(errorContext);

      if (errorContext) {
        _errorType = errorContext.errorType;
        _message = errorContext.message;
        _scheme = errorContext.scheme;
        _attributes = errorContext.attributes;
      }
    }

    return Boom[_errorType](_message, _scheme, _attributes);
  }

  return {
    /**
     * authenticate is the "work horse" of the plugin. it's the method that gets
     * called every time a route is requested and needs to validate/verify a JWT
     * @param {Object} request - the standard route handler request object
     * @param {Object} h - the standard hapi reply interface
     * @returns {Boolean} if the JWT is valid we return a credentials object
     * otherwise throw an error to inform the app & client of unauthorized req.
     */
    authenticate: async function (request, h) {
      let token = extract(request, options); // extract token Header/Cookie/Query
      let tokenType = options.tokenType || 'Token'; // see: https://git.io/vXje9
      let decoded, keyFunc;

      if (!token) {
        return h.unauthenticated(raiseError('unauthorized', null, tokenType), {credentials: tokenType});
      }

      // If we are receiving a headerless JWT token let reconstruct it using the custom function
      if(options.headless && typeof options.headless === 'object' && extract.isHeadless(token)){
          token = `${Buffer.from(JSON.stringify(options.headless)).toString("base64")}.${token}`;
      }

      
      // quick check for validity of token format
      if (!extract.isValid(token)) {
        return h.unauthenticated(raiseError('unauthorized',
          'Invalid token format', tokenType), {credentials: token});
      }
      // verification is done later, but we want to avoid decoding if malformed
      request.auth.token = token; // keep encoded JWT available in the request
      // otherwise use the same key (String) to validate all JWTs
      try {
        decoded = JWT.decode(token, { complete: options.complete || false });
      } catch(e) {
        return h.unauthenticated(raiseError('unauthorized',
        'Invalid token format', tokenType), { credentials: token });
      }
      const { key, ...extraInfo } = internals.isFunction(options.key) ? await options.key(decoded) : {key: options.key };
      // if keyFunc is function allow dynamic key lookup: https://git.io/vXjvY
      if (typeof options.validate === 'function') {
        
        let verifyOptions = options.verifyOptions || {};
        let keys = (Array.isArray(key)) ? key : [key];
        let keysTried = 0;

        if (extraInfo) {
          request.plugins[pkg.name] = {extraInfo};
        }
        
        let k;
        for(let i = 0; i < keys.length; ++i) {
          k = keys[i];
          let verify_decoded;
          try {
            verify_decoded = JWT.verify(token, k, verifyOptions);
          } catch(verify_err) {
            if (i >= keys.length - 1) {
              // we have exhausted all keys and still fail
              let err_message = (verify_err.message === 'jwt expired' ? 'Expired token' : 'Invalid token');
              return h.unauthenticated(raiseError('unauthorized',
                err_message, tokenType), { credentials: token });
            }
            // verification failed but there are still keys to try
            continue;
          }
          try {
            let { isValid, credentials, response } = await options.validate(verify_decoded, request, h);
            if (response !== undefined) {
              return h.response(response).takeover();
            }
            if (!isValid) {
              // invalid credentials
              return h.unauthenticated(raiseError('unauthorized',
              'Invalid credentials', tokenType),
              { credentials: decoded });
            }
            // valid key and credentials
            return h.authenticated({
              credentials: credentials && typeof credentials === 'object' ? credentials : decoded,
              artifacts: token
            });
          } catch(validate_err) {
            return h.unauthenticated(raiseError('boomify', validate_err), { credentials: decoded })
          }
        };
      }
      // see: https://github.com/dwyl/hapi-auth-jwt2/issues/130
      try {
        let { isValid, credentials } = await options.verify(decoded, request);
        if (!isValid) {
          return h.unauthenticated(raiseError('unauthorized', 'Invalid credentials',
          tokenType), { credentials: decoded });
        }
        return h.authenticated({
          credentials: credentials || decoded,
          artifacts: token
        });
      } catch(verify_error) {
        return h.unauthenticated(raiseError('boomify', verify_error), { credentials: decoded })
      }
    },
    // payload is an Optional method called if an options.payload is set.
    // cf. https://hapijs.com/tutorials/auth?lang=en_US
    /**
     * response is an Optional method called if an options.responseFunc is set.
     * @param {Object} request - the standard route handler request object
     * @param {Object} h - the standard hapi reply interface ...
     * after we run the custom options.responseFunc we h.continue to execute
     * the next plugin in the list.
     * @returns {Boolean} true. always return true (unless there's an error...)
     */
    response: function (request, h) {
      if (options.responseFunc && typeof options.responseFunc === 'function') {
        try {
          // allow responseFunc to decorate or throw
          options.responseFunc(request, h);
        } catch(err) {
          throw raiseError('boomify', err);
        }
      }
      return h.continue;
    }
  }
};
