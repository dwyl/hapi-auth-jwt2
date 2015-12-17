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
    t.equal(response.statusCode, 200, "GET / works without token");

    t.end();
  });
});

test("Access route configured in 'try' mode ", function(t) {
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'NoSecret');
  var options = {
    method: "GET",
    url: "/try",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(response.result);
    t.equal(response.statusCode, 200, "GET /try should pass");
    t.end();
  });
});
