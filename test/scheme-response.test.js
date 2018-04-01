const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

const server = require('./scheme-response-server'); // test server which in turn loads our module

test("Attempt to access restricted content (without auth token)", async function(t) {
  const options = {
    method: "POST",
    url: "/privado"
  };

  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No Token should fail");
    t.equal(response.headers.authorization, undefined, 'Invalid requests should not be calling the response function');
    t.end();
});


test("Attempt to access restricted content (with an INVALID Token)", async function(t) {
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer fails.validation" }
  };

  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.equal(response.headers.authorization, undefined, 'Invalid requests should not be calling the response function');
    t.end();
});


test("Access restricted content (with VALID Token)", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };

  const response = await server.inject(options);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling response function');
    t.end();
});


test("Auth mode 'required' should require authentication header", async function(t) {
  const options = {
    method: "POST",
    url: "/required"
  };

  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No token header should fail in auth 'required' mode");
    t.equal(response.headers.authorization, undefined, 'Invalid requests should not be calling the response function');
    t.end();
});


test("Auth mode 'required' should should pass with valid token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/required",
    headers: { authorization: "Bearer " + token }
  };

  const response = await server.inject(options);
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling response function');
    t.end();
});


test("Scheme should set token in request.auth.token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "GET",
    url: "/token",
    headers: { authorization: "Bearer " + token }
  };

  const response = await server.inject(options);
    t.equal(response.result, token, 'Token is accesible from handler');
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling response function');
    t.end();
});

test("Testing an error thrown from the scheme\'s response function", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "GET",
    url: "/token",
    headers: {
        authorization: "Bearer " + token,
        error: 'true'
    }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 500, 'A server error happens in the scheme\'s response function');
    t.end();
});

test("Access restricted content (with VALID Token) and async response function", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/async",
    headers: { authorization: "Bearer " + token }
  };

  const response = await server.inject(options);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.equal(response.headers.authorization, 'from scheme response function', 'Valid request should finish by calling async response function');
    t.end();
});

test("Testing an error thrown from the scheme\'s async response function", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/async",
    headers: {
        authorization: "Bearer " + token,
        error: 'true'
    }
  };
  const response = await server.inject(options);
    t.equal(response.statusCode, 500, 'A server error happens in the scheme\'s response function');
    t.end();
});
