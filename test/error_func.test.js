var test   = require('tape');
var JWT    = require('jsonwebtoken');
// var secret = 'NeverShareYourSecret';

var server = require('./error_func_server'); // test server which in turn loads our module

test("Access a route that has no auth strategy", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "GET / still works without token.");
    t.end();
  });
});

test("customVerify simulate error condition", function(t) {
  var payload = { id: 123, "name": "Charlie", error: true }
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 500, "customVerify force error");
    t.equal(response.result.message, "An internal server error occurred", "GET /required with forced error that has not been customised");
    t.end();
  });
});

test("customVerify simulate error condition but is safely not customised", function(t) {
  var payload = { id: 123, "name": "Charlie", custom_error: 'ignore'}
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 500, "customVerify force error");
    t.equal(response.result.message, "An internal server error occurred", "GET /required with forced error that has not been customised");
    t.end();
  });
});

test("customVerify with fail condition", function(t) {
  var payload = { id: 123, "name": "Charlie", some_property: false }
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "GET /required with customVerify rejected");
    t.equal(response.result.message, "Invalid credentials mate", "GET /required with customVerify rejected and customised error message");
    t.end();
  });
});

test("Custom Verification in 'try' mode ", function(t) {
  var payload = { id: 123, "name": "Charlie", some_property: true }
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/try",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.result.id, payload.id, 'Decoded JWT returned by handler');
    t.equal(response.statusCode, 200, "GET /try bypasses verification");
    t.end();
  });
});

test("Custom Verification in 'optional' mode ", function(t) {
  var payload = { id: 234, "name": "Oscar", some_property: true  }
  var token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  var options = {
    method: "GET",
    url: "/optional",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.result.id, payload.id, 'Decoded JWT returned by handler');
    t.equal(response.statusCode, 200, "GET /optional bypasses verification");
    t.end();
  });
});

test("Custom Verification in 'required' mode ", function(t) {
  var payload = { id: 345, "name": "Romeo", some_property: true }
  var token = JWT.sign(payload, 'AnyStringWillDo');
  var options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(response.result);
    var credentials = JSON.parse(JSON.stringify(response.result));
    t.equal(credentials.id, payload.id, 'Decoded JWT is available in handler');
    t.equal(response.statusCode, 200, "GET /required bypasses verification");
    t.end();
  });
});

