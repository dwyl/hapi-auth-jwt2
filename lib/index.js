// Load modules
var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var Hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var JWT  = require('jsonwebtoken'); // https://github.com/docdis/learn-json-web-tokens

var internals = {}; // Declare internals >> see: http://hapijs.com/styleguide

exports.register = function (server, options, next) {
  server.auth.scheme('jwt', internals.implementation);
  next();
};

exports.register.attributes = {     // hapi requires attributes for a plugin.
    pkg: require('../package.json') // See: http://hapijs.com/tutorials/plugins
};

internals.implementation = function (server, options) {

  Hoek.assert(options, 'Missing JWT auth options'); // pre-auth checks
  Hoek.assert(options.key, 'options does not contain secret key'); // no signing key
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc MUST be a Valid Function');

  var scheme = {
    authenticate: function (request, reply) {
      var auth = request.headers.authorization;

      if (!auth) {
        return reply(Boom.unauthorized(null, 'Token not present'));
      }
      else { // strip pointless "Bearer " label & any whitespace > http://git.io/xP4F
        var token = auth.replace(/Bearer/gi,'').replace(/ /g,'');
        // rudimentary check for JWT validity see: http://git.io/xPBn for JWT format
        if(token.split('.').length !== 3) {
          return reply(Boom.unauthorized('Invalid Token (JWT) format', 'Token'));
        }
        else { // attempt to verify the token
          JWT.verify(token, options.key, function(err, decoded) {
            if (err) {
              return reply(Boom.unauthorized('Invalid Token', 'Token'));
            }
            else { // see: http://hapijs.com/tutorials/auth for validateFunc signature
              options.validateFunc(decoded, function (err, valid) { // bring your own checks
                // Authenticated
                return reply.continue({ credentials: "See Authorization Header!" });
                // the object containing a credentials property is REQUIRED by Hapi...
              });
            }
          });
        }
      }
    }
  };
  return scheme;
};
