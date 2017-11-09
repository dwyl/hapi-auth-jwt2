var test   = require('tape');
var JWT    = require('jsonwebtoken');

var server = require('./multiple_key_server'); // test server which in turn loads our module

test("Access restricted content with multiple valid tokens for a valid tenant", async function(t) {
  var testsOutstanding = 2;
  var finishTest = function() {
    testsOutstanding--;
    if (testsOutstanding <= 0) {
      t.end();
    }
  }
  // use the token as the 'authorization' header in requests
  var token1 = JWT.sign({ id: 123, "name": "Charlie", "tenant": "dunderMifflin" }, 'michaelscott');
  var options1 = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token1 }
  };
  const response = await server.inject(options1);
    t.equal(response.statusCode, 200, "VALID Token with 1st key should succeed!");
    t.equal(response.result.data.additional, 'something extra here if needed', 'extraInfo should be passed through');
  finishTest();
  var token2 = JWT.sign({ id: 123, "name": "Charlie", "tenant": "dunderMifflin" }, 'jimhalpert');
  var options2 = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token2 }
  };
  const response2 = await server.inject(options2);
    t.equal(response2.statusCode, 200, "VALID Token with 2nd key should succeed!");
    t.equal(response2.result.data.additional, 'something extra here if needed', 'extraInfo should be passed through');
    finishTest();
});

test("Access restricted content with an invalid token and tenant", async function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie", "tenant": "dunderMifflin" }, 'dwightschrute');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "INVALID Token should fail!");

    t.end();
});

test("Access restricted content with a valid token and tenant but user is not allowed", async function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 321, "name": "Old Gregg", "tenant": "wernhamHogg" }, 'davidbrent');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "Not allowed user should fail!");

    t.end();
});

test("Access restricted content without tenant specified in token", async function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'michaelscott');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 400, "No tenant specified should fail!");

    t.end();
});

test("Access restricted content with non-existent tenant specified", async function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie", "tenant": "princeFamilyPaper" }, 'michaelscott');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No tentant found should fail!");

    t.end();
});
