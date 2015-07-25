var Cookie = require('cookie'); // highly popular decoupled cookie parser
var Boom = require('boom'); // error handling https://github.com/hapijs/boom

function basicChecks (token, request, reply) {
 // rudimentary check for JWT validity see: http://git.io/xPBn for JWT format
 if (token.split('.').length !== 3) {
   return reply(Boom.unauthorized('Invalid token format', 'Token'));
 }
 return true;
}

 /**
  * Extract the JWT from URL, Auth Header or Cookie
  */

module.exports = function (request, reply) {
  var auth, token;
  if(request.query.token) { // tokens via url: https://github.com/dwyl/hapi-auth-jwt2/issues/19
    auth = request.query.token;
  } // JWT tokens in cookie: https://github.com/dwyl/hapi-auth-jwt2/issues/55
  else if (request.headers.authorization) {
    auth = request.headers.authorization;
  }
  else if (request.headers.cookie) {
    auth = Cookie.parse(request.headers.cookie).token;
  }
  if (!auth && (request.auth.mode === 'optional' || request.auth.mode === 'try')) {
    return reply.continue({ credentials: {} });
  }
  if (!auth) {
    return reply(Boom.unauthorized('Missing auth token'));
  }
  // strip pointless "Bearer " label & any whitespace > http://git.io/xP4F
  token = auth.replace(/Bearer/gi,'').replace(/ /g,'');
  basicChecks(token, request, reply);
  return token;
}
