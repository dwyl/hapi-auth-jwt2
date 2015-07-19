var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';
var server = require('./server.js');
var cookie_options = '; Max-Age=31536000;' //' Expires=Mon, 18 Jul 2016 05:29:45 GMT; Secure; HttpOnly';

// var cookie_options = {
//   ttl: 365 * 30 * 7 * 24 * 60 * 60 * 1000, // in the distant future ...
//   encoding: 'none',    // we already used JWT to encode
//   isSecure: true,      // warm & fuzzy feelings
//   isHttpOnly: true,    // prevent client alteration
//   clearInvalid: false, // remove invalid cookies
//   strictHeader: true   // don't allow violations of RFC 6265
// }

test("Attempt to access restricted content using inVALID Cookie Token", function(t) {
  var token = JWT.sign({ id:123,"name":"Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : "token=" + token}
  };

  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});

test("Attempt to access restricted content with VALID Token but malformed Cookie", function(t) {
  var token  = JWT.sign({ id:123,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 400, "Valid Token but inVALID COOKIE should fial!");
    t.end();
  });
});

test("Access restricted content with VALID Token Cookie", function(t) {
  var token  = JWT.sign({ id:123,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : "token=" + token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID COOKIE Token should succeed!");
    t.end();
  });
});

test("Access restricted content with VALID Token Cookie (With Options!)", function(t) {
  var token  = JWT.sign({ id:123,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : "token=" + token + cookie_options  }
  };
  console.log(' - - - - - - - - - - - - - - - OPTIONS:')
  console.log(options);
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(' - - - - - - - - - - - - - - - response:')
    console.log(response);
    t.equal(response.statusCode, 200, "VALID COOKIE Token (With Options!) should succeed!");
    t.end();
  });
});
