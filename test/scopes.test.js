const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret'; // set by ENV constiable
const server = require('./scopes_server'); // test server which in turn loads our module


test("Access restricted content using scopes (with VALID Token and VALID scope)", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/privado-with-scope",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    // console.log(" - - - - RESPONSE: ");
    // console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");

    t.end();
});

test("Access restricted content using scopes (with VALID Token and INVALID scope)", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  const options = {
    method: "POST",
    url: "/privado-with-scope",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    // console.log(" - - - - RESPONSE: ");
    // console.log(response.result);
    t.equal(response.statusCode, 401, "Denied");
    t.end();
});
