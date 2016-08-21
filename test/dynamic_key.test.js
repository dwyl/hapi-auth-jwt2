var test   = require('tape');
var JWT    = require('jsonwebtoken');

var server = require('./dynamic_key_server'); // test server which in turn loads our module

test("Access restricted content with a valid token and tenant", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie", "tenant": "dunderMifflin" }, 'michaelscott');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.equal(response.result.data.additional, 'something extra here if needed', 'extraInfo should be passed through');

    t.end();
  });
});

test("Access restricted content with an invalid token and tenant", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie", "tenant": "dunderMifflin" }, 'dwightschrute');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 401, "INVALID Token should fail!");

    t.end();
  });
});

test("Access restricted content with a valid token and tenant but user is not allowed", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 321, "name": "Old Gregg", "tenant": "wernhamHogg" }, 'davidbrent');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 401, "Not allowed user should fail!");

    t.end();
  });
});

test("Access restricted content without tenant specified in token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'michaelscott');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 400, "No tenant specified should fail!");

    t.end();
  });
});

test("Access restricted content with non-existent tenant specified", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie", "tenant": "princeFamilyPaper" }, 'michaelscott');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    console.log(" - - - - RESPONSE: ");
    console.log(response.result);
    t.equal(response.statusCode, 401, "No tentant found should fail!");

    t.end();
  });
});
