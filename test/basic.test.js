const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

const server = require('./basic_server'); // test server which in turn loads our module

test("Attempt to access restricted content (without auth token)", async function(t) {
  const options = {
    method: "POST",
    url: "/privado"
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "No Token should fail");
  t.end();
});

test("Attempt to access restricted content (with an INVALID Token)", async function(t) {
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer fails.validation" }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "INVALID Token should fail");
  t.end();
});

test("Malformed JWT", async function(t) {
  // use the token as the 'authorization' header in requests
  // const token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  // console.log(token);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer my.invalid.token" }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(response.result);
  // console.log(' '); // blank line
  t.equal(response.statusCode, 401, "INVALID Token should fail");

  // assert on the response message, so we can ensure this case fails
  // early (after decode()) with "Invalid token format" instead of too
  // late (after verify) with "Invalid token"
  t.equal(response.result.message, 'Invalid token format', 'Message should be "Invalid token format"');
  t.end();
});

test("Try using a token with missing characters in body", async function(t) {
  // use the token as the 'authorization' header in requests
  let token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  // delete some characters in body
  const tokenData = token.split('.');
  const header = tokenData[0],
      body = tokenData[1],
      signature = tokenData[2];
  token = header + '.' + body.substring(0, body.length - 1) + '.' + signature;
  /*console.log(" - - - - - - token  - - - - -");
  console.log(token);*/
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "INVALID Token should fail");
  t.end();
});

test("Try using an incorrect secret to sign the JWT", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, 'incorrectSecret');
  // console.log(" - - - - - - token  - - - - -")
  // console.log(token);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "Token signed with incorrect key fails");
  t.end();
});

test("Try using an expired token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret, { expiresIn: '1s' });
  // console.log(" - - - - - - token  - - - - -")
  // console.log(token);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  setTimeout(async function () {
    const response = await server.inject(options);
    t.equal(response.statusCode, 401, "Expired token should be invalid");
    t.equal(response.result.message, 'Expired token', 'Message should be "Expired token"');
    t.end();
  }, 1100);
});

test("Token expires while request is taking place", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret, { expiresIn: '1s' });
  const options = {
    method: "POST",
    url: "/long-running",
    headers: { authorization: "Bearer " + token  }
  };

  const response = await server.inject(options);
  t.equal(response.statusCode, 200);
  t.equal(response.result, 'Verification failed because token expired');
  t.end();
});

test("Token expires after request has taken place", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret, { expiresIn: '10s' });
  const options = {
    method: "POST",
    url: "/long-running",
    headers: { authorization: "Bearer " + token  }
  };

  const response = await server.inject(options);
  t.equal(response.statusCode, 200);
  t.equal(response.result, 'Verification passed');
  t.end();
});

test("Token is well formed but is allowed=false so should be denied", async function(t) {
  // use the token as the 'authorization' header in requests
  // const token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  const token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "Denied");
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
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
  t.equal(response.statusCode, 200, "VALID Token should succeed!");
  t.end();
});

test("Access restricted content (with Well-formed but invalid Token)", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 401, "InVALID Token should Error!");
  t.end();
});

// see: https://github.com/ideaq/hapi-auth-jwt2/issues/28
test("Request with undefined auth header should 401", async function(t) {
  const options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 401, "InVALID Token fails (as expected)!");

  t.end();
});

test("Auth mode 'required' should require authentication header", async function(t) {
  const options = {
    method: "POST",
    url: "/required"
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  t.equal(response.statusCode, 401, "No token header should fail in auth 'required' mode");
  t.end();
});

test("Auth mode 'required' should fail with invalid token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  const options = {
    method: "POST",
    url: "/required",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 401, "Invalid token should error!");
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
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 200, "Valid token should succeed!");
  t.end();
});

test("Auth mode 'optional' should pass when no auth header specified", async function(t) {
  const options = {
    method: "POST",
    url: "/optional"
  };
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 200, "No auth header should pass in optional mode!");
  t.end();
});

test("Auth mode 'optional' should fail with invalid token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  const options = {
    method: "POST",
    url: "/optional",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 401, "Invalid token should error!");
  t.end();
});

test("Auth mode 'optional' should pass with valid token", async function(t) {
  // use the token as the 'authorization' header in requests
  // const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/optional",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 200, "Valid token should succeed!");
  t.end();
});

test("Auth mode 'try' should pass when no auth header specified", async function(t) {
  const options = {
    method: "POST",
    url: "/try"
  };
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 200, "No auth header should pass in 'try' mode!");
  t.end();
});

test("Auth mode 'try' should pass with invalid token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  const options = {
    method: "POST",
    url: "/try",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.statusCode, 200, "Invalid token should pass in 'try' mode");
  t.end();
});

test("Auth mode 'try' should pass with valid token", async function(t) {
  // use the token as the 'authorization' header in requests
  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "POST",
    url: "/try",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response);
  t.equal(response.statusCode, 200, "Valid token should succeed!");
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
  // server.inject lets us simulate an http request
  const response = await server.inject(options);
  // console.log(" - - - - RESPONSE: ")
  // console.log(response.result);
  t.equal(response.result, token, 'Token is accesible from handler');
  t.end();
});

test("Scheme should set artifacts in request.auth.artifacts", async function(t) {

  const token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  const options = {
    method: "GET",
    url: "/artifacts",
    headers: { authorization: "Bearer " + token }
  };

  const response = await server.inject(options);

  const decoded = JWT.decode(token);
  const artifacts = {
    token,
    decoded,
  }

  t.same(response.result, artifacts, 'Artifacts are accesible from handler');
  t.end();
})

test.onFinish(function () {
  server.stop(function(){});
})
