var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var server = require('./scheme-response-server'); // test server which in turn loads our module

test("Warm Up the Engine", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Unrestricted endpoint will work without issues");
    t.equal(response.headers.authorization, undefined, 'Endpoints that do not call the authorization scheme should not be called');
    t.end();
  });
});

test("Attempt to access restricted content (without auth token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No Token should fail");
    t.equal(response.headers.authorization, undefined, 'Invalid requests should not be calling the response function');
    t.end();
  });
});


test("Attempt to access restricted content (with an INVALID Token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer fails.validation" }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.equal(response.headers.authorization, undefined, 'Invalid requests should not be calling the response function');
    t.end();
  });
});


test("Access restricted content (with VALID Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling response function');
    t.end();
  });
});


test("Auth mode 'required' should require authentication header", function(t) {
  var options = {
    method: "POST",
    url: "/required"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No token header should fail in auth 'required' mode");
    t.equal(response.headers.authorization, undefined, 'Invalid requests should not be calling the response function');
    t.end();
  });
});


test("Auth mode 'required' should should pass with valid token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/required",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling response function');
    t.end();
  });
});


test("Scheme should set token in request.auth.token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "GET",
    url: "/token",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.result, token, 'Token is accesible from handler');
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling response function');
    t.end();
  });
});

test("Testing an error thrown from the scheme\'s response function", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "GET",
    url: "/token",
    headers: {
        authorization: "Bearer " + token,
        error: 'true'
    }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 500, 'A server error happens in the scheme\'s response function');
    t.end();
  });
});
