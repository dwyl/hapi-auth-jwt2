var test   = require('tape');
var JWT    = require('jsonwebtoken');
// var secret = 'NeverShareYourSecret';

var server = require('./verify_bypass_server'); // test server which in turn loads our module

test("Access a route that has no auth strategy", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "GET / still works without token.");
    t.end();
  });
});

test("Bypass Verification in 'try' mode ", function(t) {
  var payload = { id: 123, "name": "Charlie" }
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/try",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.result.id, payload.id, 'Decoded JWT returned by handler');
    t.equal(response.statusCode, 200, "GET /try bypasses verification");
    t.end();
  });
});

test("Bypass Verification in 'optional' mode ", function(t) {
  var payload = { id: 234, "name": "Oscar" }
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/optional",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.result.id, payload.id, 'Decoded JWT returned by handler');
    t.equal(response.statusCode, 200, "GET /optional bypasses verification");
    t.end();
  });
});

test("Bypass Verification in 'required' mode ", function(t) {
  var payload = { id: 345, "name": "Romeo" }
  var token = JWT.sign(payload, 'AnyStringWillDo');
  var options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    // console.log(response.result);
    var credentials = JSON.parse(JSON.stringify(response.result));
    t.equal(credentials.id, payload.id, 'Decoded JWT is available in handler');
    t.equal(response.statusCode, 200, "GET /required bypasses verification");
    t.end();
  });
});
