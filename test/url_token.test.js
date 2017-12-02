const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

const server = require('./basic_server.js');

test("Attempt to access restricted content (without auth token)", async function(t) {
  const options = {
    method: "POST",
    url: "/privado"
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No Token supplied > fails (as expected)");
    t.end();
});

test("Attempt to access restricted content (with an INVALID URL Token)", async function(t) {
  const token = "?token=my.invalid.token";
  const options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
});

test("Try using an incorrect secret to sign the JWT", async function(t) {
  // use the token as the 'authorization' header in requests
  let token = JWT.sign({ id: 123, "name": "Charlie" }, 'incorrectSecret');
  token = "?token=" + token;
  // console.log(" - - - - - - token  - - - - -")
  // console.log(token);
  const options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "URL Token signed with incorrect key fails");
    t.end();
});

test("URL Token is well formed but is allowed=false so should be denied", async function(t) {
  // use the token as the 'authorization' header in requests
  // const token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  let token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  token = "?token=" + token;
  const options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "User is Denied");
    t.end();
});

test("Access restricted content (with VALID Token)", async function(t) {
  // use the token as the 'authorization' header in requests
  let token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  token = "?token=" + token;
  const options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
});

test("Using route with urlKey=false should be denied", async function(t) {
  // use the token as the 'authorization' header in requests
  let token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  token = "?token=" + token;
  const options = {
    method: "POST",
    url: "/privadonourl" + token
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No urlKey configured so URL-Tokens should be denied");
    t.end();
});

test("Using route with urlKey='' should be denied", async function(t) {
  // use the token as the 'authorization' header in requests
  let token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  token = "?=" + token;
  const options = {
    method: "POST",
    url: "/privadonourl2" + token
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No urlKey configured so URL-Tokens should be denied");
    t.end();
});
