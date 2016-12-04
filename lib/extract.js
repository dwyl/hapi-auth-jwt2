'use strict';

var Cookie = require('cookie'); // highly popular decoupled cookie parser

/**
 * customOrDefaultKey is a re-useable method to determing if the developer
 * using the plugin has defined a custom key for extractin the JWT
 * @param {Object} options - the options passed in when registering the plugin
 * @param {String} key - name of the key e.g `urlKey` see: https://git.io/vXbJN
 * @param {String} _default - the default key used if no custom is defined.
 * @returns {String} key - the custom key or default key.
 */
function customOrDefaultKey (options, key, _default) {
  return options[key] === false
  || typeof options[key] === 'string' ? options[key] : _default;
}

 /**
  * Extract the JWT from URL, Auth Header or Cookie
  * @param {Object} request - standard hapi request object inclduing headers
  * @param {Object} options - the configuration options defined by the person
  * using the plugin. this includes relevant keys. (see docs in Readme)
  * @returns {String} token - the raw JSON Webtoken or `null` if invalid
  */
module.exports = function extract (request, options) {
  // The key holding token value in url or cookie defaults to token
  var auth, token;
  var cookieKey = customOrDefaultKey(options, 'cookieKey', 'token');
  var headerKey = customOrDefaultKey(options, 'headerKey', 'authorization');
  var urlKey = customOrDefaultKey(options, 'urlKey', 'token');
  var pattern = new RegExp(options.tokenType + '\\s+([^$]+)', 'i');

  if (urlKey && request.query[urlKey]) { // tokens via url: https://github.com/dwyl/hapi-auth-jwt2/issues/19
    auth = request.query[urlKey];
  } else if (headerKey && request.headers[headerKey]) {
    if (typeof options.tokenType === 'string') {
      token = request.headers[headerKey].match(pattern);
      auth = token === null ? null : token[1];
    } else {
      auth = request.headers[headerKey];
    } // JWT tokens in cookie: https://github.com/dwyl/hapi-auth-jwt2/issues/55
  } else if (cookieKey && request.headers.cookie) {
    auth = Cookie.parse(request.headers.cookie)[cookieKey];
  }

  // strip pointless "Bearer " label & any whitespace > http://git.io/xP4F
  return auth ? auth.replace(/Bearer/gi, '').replace(/ /g, '') : null;
};

/**
 * isValid is a basic check for JWT validity of Token format http://git.io/xPBn
 * @param {String} token - the token extracted from Header/Cookie/query
 * @returns {Boolean} true|false - true if JWT is valid. false if invalid.
 */
module.exports.isValid = function isValid (token) {
  return token.split('.').length === 3;
};
