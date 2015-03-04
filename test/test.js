var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var server = require('./server'); // test server which in turn loads our module

test("Warm Up the Engine", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Welcome to Timer Land");
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
    t.end();
  });
});

test("Attempt to access restricted content (with an inVALID Token)", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  // console.log(token);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer my.invalid.token" }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});

test("Access restricted content (with VALID Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:1,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer "+token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID Token should succeed!");

    t.end();
  });
});
