'use strict';

const Boom = require('@hapi/boom'); // error handling https://github.com/hapijs/boom
const assert = require('assert'); // use assert to check if options are set
const JWT = require('jsonwebtoken'); // https://github.com/docdis/learn-json-web-tokens
const extract = require('./extract'); // extract token from Auth Header, URL or Cookie
const pkg = require('../package.json'); // use package name and version rom package.json
const internals = {}; // see: http://hapijs.com/styleguide#module-globals

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
  register: function(server, options) {
    server.auth.scheme('jwt', internals.implementation); // hapijs.com/api#serverauthapi
  },
};

/**
 * attributes merely aliases the package.json (re-uses package name & version)
 * simple example: github.com/hapijs/hapi/blob/master/API.md#serverplugins
 */
exports.plugin.pkg = pkg; // hapi requires attributes for a plugin.
// also see: http://hapijs.com/tutorials/plugins

/**
 * specify peer dependency on hapi, enforced by hapi at runtime
 */
exports.plugin.requirements = {
  hapi: '>=17',
};

internals.FIRST_PASS_AUTHENTICATION_FAILED = 'firstPassAuthenticationFailed';

/**
 * checkObjectType returns the class of the object's prototype
 * @param {Object} objectToCheck - the object for which we want to check the type
 * @returns {String} - the string of the object class
 */
internals.checkObjectType = function(objectToCheck) {
  const toString = Object.prototype.toString;
  return toString.call(objectToCheck);
};

/**
 * isFunction checks if a given value is a function.
 * @param {Object} functionToCheck - the object we want to confirm is a function
 * @returns {Boolean} - true if the functionToCheck is a function. :-)
 */
internals.isFunction = function(functionToCheck) {
  return (
    functionToCheck &&
    (internals.checkObjectType(functionToCheck) === '[object Function]' ||
      internals.checkObjectType(functionToCheck) === '[object AsyncFunction]')
  );
};

internals.getKeys = async function(decoded, options) {
  // if keyFunc is function allow dynamic key lookup: https://git.io/vXjvY
  const { key, ...extraInfo } = internals.isFunction(options.key)
    ? await options.key(decoded)
    : { key: options.key };
  const keys = Array.isArray(key) ? key : [key];
  return { keys, extraInfo };
};

internals.verifyJwt = function(token, keys, options) {
  let error;
  for (const k of keys) {
    try {
      return JWT.verify(token, k, options.verifyOptions);
    } catch (verify_err) {
      error = verify_err;
    }
  }
  throw error;
};

internals.authenticate = async function(token, options, request, h) {
  let tokenType = options.tokenType || 'Token'; // see: https://git.io/vXje9
  let decoded;

  if (!token) {
    return {
      error: internals.raiseError(
        options,
        request,
        h,
        'unauthorized',
        'token is null',
        tokenType,
        null, //attributes
        true //flag missing token to HAPI auth framework to allow subsequent auth strategies
      ),
      payload: {
        credentials: tokenType,
      },
    };
  }

  // quick check for validity of token format
  if (!extract.isValid(token)) {
    return {
      error: internals.raiseError(
        options,
        request,
        h,
        'unauthorized',
        'Invalid token format',
        tokenType,
        null, //attributes
        true //flag missing token to HAPI auth framework to allow subsequent auth strategies
      ),
      payload: {
        credentials: token,
      },
    };
  }
  // verification is done later, but we want to avoid decoding if malformed
  request.auth.token = token; // keep encoded JWT available in the request
  // otherwise use the same key (String) to validate all JWTs
  try {
    decoded = JWT.decode(token, { complete: options.complete || false });
  } catch (e) {
    // fix for https://github.com/dwyl/hapi-auth-jwt2/issues/328 -
    // JWT.decode() can fail either by throwing an exception or by
    // returning null, so here we just fall through to the following
    // block that tests if decoded is not set, so that we can handle
    // both failure types at once
  }

  if (!decoded) {
    return {
      error: internals.raiseError(
        options,
        request,
        h,
        'unauthorized',
        'Invalid token format',
        tokenType
      ),
      payload: {
        credentials: token,
      },
    };
  }

  if (typeof options.validate === 'function') {
    const { keys, extraInfo } = await internals.getKeys(decoded, options);

    /* istanbul ignore else */
    if (extraInfo) {
      request.plugins[pkg.name] = { extraInfo };
    }

    let verify_decoded;
    try {
      verify_decoded = internals.verifyJwt(token, keys, options);
    } catch (verify_err) {
      let err_message =
        verify_err.message === 'jwt expired'
          ? 'Expired token'
          : 'Invalid token';
      return {
        error: internals.raiseError(
          options,
          request,
          h,
          'unauthorized',
          err_message,
          tokenType
        ),
        payload: { credentials: token },
      };
    }

    try {
      let {
        isValid,
        credentials,
        response,
        errorMessage,
      } = await options.validate(verify_decoded, request, h);
      if (response !== undefined) {
        return { response };
      }
      if (!isValid) {
        // invalid credentials
        return {
          error: internals.raiseError(
            options,
            request,
            h,
            'unauthorized',
            errorMessage || 'Invalid credentials',
            tokenType
          ),
          payload: { credentials: decoded },
        };
      }
      // valid key and credentials
      return {
        payload: {
          credentials:
            credentials && typeof credentials === 'object'
              ? credentials
              : decoded,
          artifacts: {
            token,
            decoded,
          },
        },
      };
    } catch (validate_err) {
      return {
        error: internals.raiseError(
          options,
          request,
          h,
          'boomify',
          validate_err
        ),
        payload: {
          credentials: decoded,
        },
      };
    }
  }
  // see: https://github.com/dwyl/hapi-auth-jwt2/issues/130
  try {
    // note: at this point, we know options.verify must be non-null,
    // because options.validate or options.verify are required to have
    // been provided, and if options.validate were non-null, then we
    // would have hit the above block and already returned out of this
    // function
    let { isValid, credentials } = await options.verify(decoded, request);
    if (!isValid) {
      return {
        error: internals.raiseError(
          options,
          request,
          h,
          'unauthorized',
          'Invalid credentials',
          tokenType
        ),
        payload: { credentials: decoded },
      };
    }

    return {
      payload: {
        credentials: credentials,
        artifacts: {
          token,
          decoded,
        },
      },
    };
  } catch (verify_error) {
    return {
      error: internals.raiseError(options, request, h, 'boomify', verify_error),
      payload: {
        credentials: decoded,
      },
    };
  }
};

// allow custom error raising or default to Boom if no errorFunc is defined
internals.raiseError = function raiseError(
  options,
  request,
  h,
  errorType,
  message,
  scheme,
  attributes,
  isMissingToken
) {
  let errorContext = {
    errorType: errorType,
    message: message,
    scheme: scheme,
    attributes: attributes,
  };

  if (internals.isFunction(options.errorFunc)) {
    errorContext = options.errorFunc(errorContext, request, h);
  }
  // Since it is clearly specified in the docs that
  // the errorFunc must return an object with keys:
  // errorType and message, we need not worry about
  // errorContext being undefined

  const error = Boom[errorContext.errorType](
    errorContext.message,
    errorContext.scheme,
    errorContext.attributes
  );

  return isMissingToken
    ? Object.assign(error, {
        isMissing: true,
      })
    : error;
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
internals.implementation = function(server, options) {
  assert(options, 'options are required for jwt auth scheme'); // pre-auth checks
  assert(
    options.validate || options.verify,
    'validate OR verify function is required!'
  );

  return {
    /**
     * authenticate is the "work horse" of the plugin. it's the method that gets
     * called every time a route is requested and needs to validate/verify a JWT
     * @param {Object} request - the standard route handler request object
     * @param {Object} h - the standard hapi reply interface
     * @returns {Boolean} if the JWT is valid we return a credentials object
     * otherwise throw an error to inform the app & client of unauthorized req.
     */
    authenticate: async function(request, h) {
      let token = extract(request, options); // extract token Header/Cookie/Query
      if (
        token == null &&
        options.attemptToExtractTokenInPayload &&
        request.method.toLowerCase() === 'post'
      ) {
        return h.authenticated({
          credentials: {
            error: internals.FIRST_PASS_AUTHENTICATION_FAILED,
          },
        });
      }
      const result = await internals.authenticate(token, options, request, h);
      if (result.error) {
        return h.unauthenticated(result.error, result.payload);
      } else if (result.response) {
        return h.response(result.response).takeover();
      } else {
        return h.authenticated(result.payload);
      }
    },
    /**
     * payload is an Optional method called if an options.payload is set.
     * cf. https://hapijs.com/tutorials/auth?lang=en_US
     * @param {Object} request - the standard route handler request object
     * @param {Object} h - the standard hapi reply interface ...
     * after we run the custom options.payloadFunc we h.continue to execute
     * the next plugin in the list.
     * @returns {Boolean} true. always return true (unless there's an error...)
     */
    payload: async function(request, h) {
      if (
        options.attemptToExtractTokenInPayload &&
        request.auth.credentials.error ===
          internals.FIRST_PASS_AUTHENTICATION_FAILED
      ) {
        const token = extract(request, options);
        const result = await internals.authenticate(token, options, request, h);
        if (result && !result.error && result.payload) {
          request.auth.credentials = result.payload.credentials;
          request.auth.token = result.payload.token;
        } else {
          delete result.error.isMissing;
          return result.error;
        }
      }
      const payloadFunc = options.payloadFunc;
      if (payloadFunc && typeof payloadFunc === 'function') {
        return payloadFunc(request, h);
      }
      return h.continue;
    },

    /**
     * response is an Optional method called if an options.responseFunc is set.
     * @param {Object} request - the standard route handler request object
     * @param {Object} h - the standard hapi reply interface ...
     * after we run the custom options.responseFunc we h.continue to execute
     * the next plugin in the list.
     * @returns {Boolean} true. always return true (unless there's an error...)
     */
    response: function(request, h) {
      const responseFunc = options.responseFunc;
      if (responseFunc && typeof responseFunc === 'function') {
        if (
          internals.checkObjectType(responseFunc) === '[object AsyncFunction]'
        ) {
          return responseFunc(request, h)
            .then(() => h.continue)
            .catch(err =>
              internals.raiseError(options, request, h, 'boomify', err)
            );
        }
        try {
          // allow responseFunc to decorate or throw
          responseFunc(request, h);
        } catch (err) {
          throw internals.raiseError(options, request, h, 'boomify', err);
        }
      }
      return h.continue;
    },

    verify: async function(auth) {
      const token = auth.artifacts.token;
      const decoded = JWT.decode(token, {
        complete: options.complete || false,
      });
      const { keys } = await internals.getKeys(decoded, options);
      internals.verifyJwt(token, keys, options);
    },
  };
};
