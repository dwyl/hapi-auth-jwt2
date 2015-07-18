var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var server = require('./server.js');

test("Attempt to access restricted content using inVALID Cookie Token", function(t) {
  var token = JWT.sign({ id:123,"name":"Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : "token="+token }
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
    console.log(' - - - - - - - - - response - - - - - - - - -');
    console.log(response.headers)
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - \n');
    t.equal(response.statusCode, 400, "Valid Token but inVALID COOKIE should fial!");
    t.end();
  });
});

test("Access restricted content with VALID Token Cookie", function(t) {
  var token  = JWT.sign({ id:123,"name":"Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : "token="+token } // MUST have token
  };
  console.log(' - - - - - - - - - OPTIONS - - - - - - - - - ');
  console.log(options);
  console.log(' - - - - - - - - - OPTIONS - - - - - - - - - \n');
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(' - - - - - - - - - response - - - - - - - - -');
    console.log(response.headers)
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - \n');
    t.equal(response.statusCode, 200, "VALID COOKIE Token should succeed!");
    t.end();
  });
});
