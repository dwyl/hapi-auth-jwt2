const test   = require('tape');
const JWT    = require('jsonwebtoken');
// const secret = 'NeverShareYourSecret';

const server = require('./verify_func_server'); // test server which in turn loads our module

test("Access a route that has no auth strategy", async function(t) {
  const options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 204, "GET / still works without token.");
    t.end();
});

test("customVerify malformed JWT", async function(t) {
  // this test verifies the fix for
  // https://github.com/dwyl/hapi-auth-jwt2/issues/328

  const options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer my.invalid.token" }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(response.result);
  t.equal(response.statusCode, 401, "INVALID Token should fail");

  // assert on the response message, so we can ensure this case fails
  // early (after decode()) with "Invalid token format" before it ever
  // even attempts to call our customVerify function
  t.equal(response.result.message, 'Invalid token format', "INVALID Token should fail");
  t.end();
});

test("customVerify simulate error condition", async function(t) {
  const payload = { id: 123, "name": "Charlie", error: true }
  const token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  const options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 500, "customVerify force error");
    t.end();
});

test("customVerify with fail condition", async function(t) {
  const payload = { id: 123, "name": "Charlie", some_property: false }
  const token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  const options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "GET /required with customVerify rejected");
    t.equal(response.result.message, 'Invalid credentials', "GET /required with customVerify rejected");
    t.end();
});

test("Custom Verification in 'try' mode ", async function(t) {
  const payload = { id: 123, "name": "Charlie", some_property: true }
  const token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  const options = {
    method: "GET",
    url: "/try",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.result.id, payload.id, 'Decoded JWT returned by handler');
    t.equal(response.statusCode, 200, "GET /try bypasses verification");
    t.end();
});

test("Custom Verification in 'optional' mode ", async function(t) {
  const payload = { id: 234, "name": "Oscar", some_property: true  }
  const token = JWT.sign(payload, 'SecretDoesNOTGetVerified');
  const options = {
    method: "GET",
    url: "/optional",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.result.id, payload.id, 'Decoded JWT returned by handler');
    t.equal(response.statusCode, 200, "GET /optional bypasses verification");
    t.end();
});

test("Custom Verification in 'required' mode ", async function(t) {
  const payload = { id: 345, "name": "Romeo", some_property: true }
  const token = JWT.sign(payload, 'AnyStringWillDo');
  const options = {
    method: "GET",
    url: "/required",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    // console.log(response.result);
    const credentials = JSON.parse(JSON.stringify(response.result));
    t.equal(credentials.id, payload.id, 'Decoded JWT is available in handler');
    t.equal(response.statusCode, 200, "GET /required bypasses verification");
    t.end();
});
