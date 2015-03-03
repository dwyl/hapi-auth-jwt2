// Load modules

var Boom = require('boom');
var Hoek = require('hoek');
var JWT  = require('jsonwebtoken');

// Declare internals >> see: http://hapijs.com/styleguide

var internals = {};

exports.register = function (server, options, next) {
  server.auth.scheme('jwt', internals.implementation);
  next();
};

// hapi requires attributes for a plugin. See: http://hapijs.com/tutorials/plugins
exports.register.attributes = {
    pkg: require('../package.json')
};

internals.implementation = function (server, options) {

  // pre-auth checks
  Hoek.assert(options, 'Missing JWT auth options');
  Hoek.assert(options.key, 'options does not contain secret key');
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc MUST be a Valid Function');

  var scheme = {
    authenticate: function (request, reply) {

      var auth = request.headers.authorization;
      // console.log("AUTH: "+auth);
      if (!auth) {
        return reply(Boom.unauthorized(null, 'Token not present'));
      }
      else {
        // strip off the pointless "Bearer " label and any whitespace
        var token = auth.replace(/Bearer/gi,'').replace(/ /g,'');

        // rudimentary check for JWT validity
        if(token.split('.').length !== 3) {
          return reply(Boom.unauthorized('Invalid Token (JWT) format', 'Token'));
        } // see: https://github.com/docdis/learn-json-web-tokens for JWT format
        else {

          JWT.verify(token, options.key, function(err, decoded) {
            if (err) {
              return reply(Boom.unauthorized('Invalid Token', 'Token'));
            }
            else {
              // see: http://hapijs.com/tutorials/auth for validateFunc signature
              options.validateFunc(decoded, function (err, valid) {

                if (err || !valid) {
                  return reply(Boom.unauthorized('Invalid token', 'Token'), null, { credentials: "Please Login." });
                }
                // Authenticated
                return reply.continue({ credentials: "See Authorization Header!" });
                // the object containing a credentials property is required by Hapi...
              });
            }
          });
        }
      }
    }
  };

  return scheme;
};
