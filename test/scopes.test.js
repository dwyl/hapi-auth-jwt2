var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret'; // set by ENV Variable
var server = require('./scopes_server'); // test server which in turn loads our module


test("Access restricted content using scopes (with VALID Token and VALID scope)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado-with-scope",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");

    t.end();
  });
});

test("Access restricted content using scopes (with VALID Token and INVALID scope)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  var options = {
    method: "POST",
    url: "/privado-with-scope",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 401, "Denied");
    t.end();
  });
});
