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

test("Malformed JWT", function(t) {
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
    console.log(response.result);
    console.log(' '); // blank line
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    // t.equal(JSON.parse(response.result).msg, 'Invalid Token', "INVALID Token should fail");
    t.end();
  });
});

test("Try using an incorrect secret to sign the JWT", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:123,"name":"Charlie" }, 'incorrectSecret');
  console.log(" - - - - - - token  - - - - -")
  console.log(token);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer "+token  }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Token signed with incorrect key fails");
  t.equal(true, true, "true is true")
    t.end();
  });
});

test("Token is well formed but is allowed=false so should be denied", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  var token = JWT.sign({ id:321,"name":"Old Gregg" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer "+token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Denied");
    t.end();
  });
});

test("Access restricted content (with VALID Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:123,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer "+token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ")
    console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");

    t.end();
  });
});

test("Access restricted content (with Well-formed but invalid Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:123,"name":"Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer "+token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ")
    console.log(response.result);
    t.equal(response.statusCode, 401, "InVALID Token should Error!");

    t.end();
  });
});

// see: https://github.com/ideaq/hapi-auth-jwt2/issues/28
test("Request with undefined auth header should 401", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:321,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ")
    console.log(response.result);
    t.equal(response.statusCode, 401, "InVALID Token fails (as expected)!");

    t.end();
  });
});
