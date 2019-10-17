const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';
const server = require('./multi_auth_server.js');

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

// supply valid Basic Auth Header but invalid Payload
// should succeed because Auth Header is first
test("Authorization Header should take precedence over any payload", async function(t) {
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    headers: {
      authorization: "Basic dGVzdDpwYXNzd29yZA=="
    },
    payload: { token: "malformed.token" },
  };
  const response = await server.inject(options);
    // console.log(' - - - - - - - - - - - - - - - response:')
    // console.log(response);
    t.equal(response.statusCode, 200, "Ignores payload when Auth Header is set");
    t.end();
});
