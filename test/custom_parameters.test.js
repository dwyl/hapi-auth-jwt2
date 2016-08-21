var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';
var server = require('./custom_parameters_server.js');
var cookie_options = '; Max-Age=31536000;'; //' Expires=Mon, 18 Jul 2016 05:29:45 GMT; Secure; HttpOnly';

// Those tests are the same as cookie-test and url-token-test but with custom parameters in cookie or URL

test("Attempt to access restricted content using inVALID Cookie Token - custom parameters", function(t) {
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie: "customCookieKey=" + token }
  };
  console.log(options);
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});

test("Attempt to access restricted content with VALID Token but malformed Cookie - custom parameters", function(t) {
  var token  = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie: token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 400, "Valid Token but inVALID COOKIE should fial!");
    t.end();
  });
});

test("Access restricted content with VALID Token Cookie - custom parameters", function(t) {
  var token  = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie: "customCookieKey=" + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID COOKIE Token should succeed!");
    t.end();
  });
});

test("Access restricted content with VALID Token Cookie (With Options!) - custom parameters", function(t) {
  var token  = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie: "customCookieKey=" + token + cookie_options }
  };
  // console.log(' - - - - - - - - - - - - - - - OPTIONS:')
  // console.log(options);
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(' - - - - - - - - - - - - - - - response:')
    // console.log(response);
    t.equal(response.statusCode, 200, "VALID COOKIE Token (With Options!) should succeed!");
    t.end();
  });
});

/** Regressions Tests for https://github.com/dwyl/hapi-auth-jwt2/issues/65 **/

// supply valid Token Auth Header but invalid Cookie
// should succeed because Auth Header is first
test("Authorization Header should take precedence over any cookie - custom parameters", function(t) {
  var token    = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: {
      authorization: "MyAuthScheme " + token,
      cookie: "customCookieKey=malformed.token" + cookie_options
    }
  };
  server.inject(options, function(response) {
    // console.log(' - - - - - - - - - - - - - - - response:')
    // console.log(response);
    t.equal(response.statusCode, 200, "Ignores cookie when Auth Header is set");
    t.end();
  });
});

// valid google analytics cookie but invalid auth header token
// see: https://github.com/dwyl/hapi-auth-jwt2/issues/65#issuecomment-124791842
test("Valid Google Analytics cookie should be ignored - custom parameters", function(t) {
  var GA = "gwcm=%7B%22expires%22%3Anull%2C%22clabel%22%3A%22SbNVCILRtFcQwcrE6gM%22%2C%22backoff%22%3A1437241242%7D; _ga=GA1.2.1363734468.1432273334";
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: {
      authorization: "MyAuthScheme " + token,
      cookie: GA
    }
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Ignores Google Analytics Cookie");
    t.end();
  });
});

test("Valid Google Analytics cookie should be ignored (BAD Header Token) - custom parameters", function(t) {
  var GA = "gwcm=%7B%22expires%22%3Anull%2C%22clabel%22%3A%22SbNVCILRtFcQwcrE6gM%22%2C%22backoff%22%3A1437241242%7D; _ga=GA1.2.1363734468.1432273334";
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'invalid');
  var options = {
    method: "POST",
    url: "/privado",
    headers: {
      authorization: "MyAuthScheme " + token,
      cookie: GA
    }
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Ignores GA but Invalid Auth Header still rejected");
    t.end();
  });
});

// Supply a VALID Token in Cookie A-N-D valid GA in Cookie!!
test("Valid Google Analytics cookie should be ignored (BAD Header Token) - custom parameters", function(t) {
  var GA = "gwcm=%7B%22expires%22%3Anull%2C%22clabel%22%3A%22SbNVCILRtFcQwcrE6gM%22%2C%22backoff%22%3A1437241242%7D; _ga=GA1.2.1363734468.1432273334";
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: {
      cookie: "customCookieKey=" + token + '; ' + GA
    }
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Valid Cookie Token Succeeds (Ignores GA)");
    t.end();
  });
});


test("Attempt to access restricted content (with an INVALID URL Token) - custom parameters", function(t) {
  var token = "?customUrlKey=my.invalid.token";
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});

test("Try using an incorrect secret to sign the JWT - custom parameters", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'incorrectSecret');
  token = "?customUrlKey=" + token;
  // console.log(" - - - - - - token  - - - - -")
  // console.log(token);
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "URL Token signed with incorrect key fails");
    t.end();
  });
});

test("URL Token is well formed but is allowed=false so should be denied - custom parameters", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  var token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  token = "?customUrlKey=" + token;
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "User is Denied");
    t.end();
  });
});

test("Access restricted content (with VALID Token) - custom parameters", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  token = "?customUrlKey=" + token;
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});

test("Attempt to access restricted content using inVALID header tokenType - custom parameters", function(t) {
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { Authorization: "InvalidAuthScheme " + token }
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});

test("Access restricted content (with VALID Token and header tokenType) - custom parameters", function(t) {
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { Authorization: "MyAuthScheme " + token }
  };

  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});
