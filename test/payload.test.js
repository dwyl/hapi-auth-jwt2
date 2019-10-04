const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';
const server = require('./payload_auth_server.js');

test("Attempt to access restricted content using inVALID Payload Token", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  const options = {
    method: "POST",
    url: "/privado",
    payload: { token: token },
  };
  // console.log(options);
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "Invalid token should error!");
  t.end();
});

test("Attempt to access restricted content with VALID Token but malformed Payload", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    payload: { notTheRightTokenKey: token },
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "Valid Token but inVALID PAYLOAD should fail!");
    t.end();
});

test("Access restricted content with VALID Token Payload", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    payload: { token: token },
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 200, "VALID PAYLOAD Token should succeed!");
    t.end();
});

/** Regressions Tests for https://github.com/dwyl/hapi-auth-jwt2/issues/65 **/

// supply valid Token Auth Header but invalid Payload
// should succeed because Auth Header is first
test("Authorization Header should take precedence over any payload", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    headers: {
      authorization: "Bearer " + token
    },
    payload: { token: "malformed.token" },
  };
  const response = await server.inject(options);
    // console.log(' - - - - - - - - - - - - - - - response:')
    // console.log(response);
    t.equal(response.statusCode, 200, "Ignores payload when Auth Header is set");
    t.end();
});

test("Attempt to access restricted content with payloadKey=false", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privadonopayload",
    payload: { token: token },
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "Disabled payload auth shouldn't accept valid token!");
    t.end();
});

test("Attempt to access restricted content with payloadKey=''", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privadonopayload2",
    payload: { token: token },
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "Disabled payload auth shouldn't accept valid token!");
    t.end();
});

