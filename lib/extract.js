var Cookie = require('cookie'); // highly popular decoupled cookie parser
var Boom = require('boom'); // error handling https://github.com/hapijs/boom

 /**
  * Extract the JWT from URL, Auth Header or Cookie
  */

module.exports = function (request, options) {

  // The key holding token value in url or cookie defaults to token
  var urlKey = typeof options.urlKey === 'string' ? options.urlKey : 'token';
  var cookieKey = typeof options.cookieKey === 'string' ? options.cookieKey : 'token';
  var auth;

  if(request.query[urlKey]) { // tokens via url: https://github.com/dwyl/hapi-auth-jwt2/issues/19
    auth = request.query[urlKey];
  } // JWT tokens in cookie: https://github.com/dwyl/hapi-auth-jwt2/issues/55
  else if (request.headers.authorization) {
    var token = request.headers.authorization.match(/Bearer\s+([^$]+)/i);
    return token === null ? null : token[1];
  }
  else if (request.headers.cookie) {
    auth = Cookie.parse(request.headers.cookie)[cookieKey];
  }

  // strip pointless "Bearer " label & any whitespace > http://git.io/xP4F
  return auth ? auth.replace(/Bearer/gi,'').replace(/ /g,'') : null;
};

module.exports.isValid = function basicChecks (token) {
 // rudimentary check for JWT validity see: http://git.io/xPBn for JWT format
 return token.split('.').length === 3;
};
