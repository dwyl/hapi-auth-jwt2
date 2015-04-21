var test   = require('tape');
var JWT    = require('jsonwebtoken');

var server = require('../example/real_world_example_using_redis_on_heroku.js');

test("Confirm GET / does not require session token", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Base URL Does not Require ");
    t.end();
  });
});

test("Attempt to access restricted content (without auth token)", function(t) {
  var options = {
    method: "POST",
    url: "/restricted"
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
    url: "/restricted",
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
    url: "/restricted",
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
    url: "/restricted",
    headers: { authorization: "Bearer "+token  }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Token signed with incorrect key fails");
  t.equal(true, true, "true is true")
    t.end();
  });
});

test("Token is well formed but session not in redis so should be denied", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  var token = JWT.sign({ id:321,"valid":true }, process.env.JWT_SECRET);
  var options = {
    method: "POST",
    url: "/restricted",
    headers: { authorization: "Bearer "+token }
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Denied");
    t.end();
  });
});

test("Attempt to access restricted content with Well-formed Token but invalid secret", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:123, "valid":true }, 'badsecret');
  var options = {
    method: "POST",
    url: "/restricted",
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

var token; // used in all subsequent tests

test("Simulate Authentication", function(t) {
  // use the token as the 'authorization' header in requests
  var options = {
    method: "POST",
    url: "/auth"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(res) {
    token = res.headers.authorization;
    console.log(" - - - - RESPONSE: ");
    console.log(res.result);
    t.equal(res.statusCode, 200, "VALID Token should succeed!");

    t.end();
  });
});

test("Access restricted content with *VALID* JWT", function(t) {
  // use the token as the 'authorization' header in requests
  var options = {
    method: 'POST',
    url: '/restricted',
    headers: { 'Authorization' : token } // token from previous test
  };
  // server.inject lets us similate an http request
  server.inject(options, function(res) {
    token = res.headers.authorization;
    console.log(" - - - - RESPONSE: ");
    console.log(res.result);
    t.equal(res.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});

test("Logout to end the session", function(t) {
  // use the token as the 'authorization' header in requests
  var options = {
    method: 'POST',
    url: '/logout',
    headers: { 'Authorization' : token } // token from previous test
  };
  // server.inject lets us similate an http request
  server.inject(options, function(res) {
    // token = res.headers.authorization;
    // console.log(" - - - - RESPONSE: ");
    console.log(res.result);
    t.equal(res.statusCode, 200, "Logout succeeded");
    t.end();
  });
});

test("Attempt to Access restricted content with JWT which is no longer valid", function(t) {
  // use the token as the 'authorization' header in requests
  var options = {
    method: 'POST',
    url: '/restricted',
    headers: { 'Authorization' : token } // token from previous test
  };
  // server.inject lets us similate an http request
  server.inject(options, function(res) {
    // token = res.headers.authorization;
    console.log(" - - - - RESPONSE: ");
    console.log(res.result);
    t.equal(res.statusCode, 401, "Session is no longer valid. (cause we logged out!)");
    t.end();
  });
});

test("End Connection to RedisCloud", function(t) {
  var options = {
    method: "GET",
    url: "/end"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Redis connection closed.");
    server.stop();
    t.end();
  });
});
