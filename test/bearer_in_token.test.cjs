const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';
const server = require('./basic_server.cjs'); // test server which in turn loads our module

/** Regression Tests for https://github.com/dwyl/hapi-auth-jwt2/issues/613 **/

// the claim n is only there so that the signature contains "bEAReR"
const token = JWT.sign({ id: 123, n: 13381116 }, secret, { noTimestamp: true });

test("The test token contains the word 'bearer'", function(t) {
  t.ok(/bearer/i.test(token), "Token contains 'bearer' in some case");
  t.end();
});

test("Access restricted content with a VALID Token containing 'bearer' in the Authorization Header", async function(t) {
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  const response = await server.inject(options);
  t.equal(response.statusCode, 200, "VALID Token containing 'bearer' should succeed!");
  t.end();
});

test("Access restricted content with a VALID Token containing 'bearer' in a Cookie", async function(t) {
  const options = {
    method: "POST",
    url: "/privado",
    headers: { cookie: "token=" + token }
  };
  const response = await server.inject(options);
  t.equal(response.statusCode, 200, "VALID Cookie Token containing 'bearer' should succeed!");
  t.end();
});

test("Access restricted content with a VALID Token containing 'bearer' in the URL", async function(t) {
  const options = {
    method: "POST",
    url: "/privado?token=" + token
  };
  const response = await server.inject(options);
  t.equal(response.statusCode, 200, "VALID URL Token containing 'bearer' should succeed!");
  t.end();
});

test("Access restricted content with a lowercase 'bearer' scheme", async function(t) {
  const validToken = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "bearer " + validToken }
  };
  const response = await server.inject(options);
  t.equal(response.statusCode, 200, "Lowercase 'bearer' scheme should be stripped");
  t.end();
});

test("Access restricted content with a VALID Token in the Authorization Header without a scheme", async function(t) {
  const validToken = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: validToken }
  };
  const response = await server.inject(options);
  t.equal(response.statusCode, 200, "Token without a scheme should succeed!");
  t.end();
});
