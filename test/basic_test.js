var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var server = require('./basic_server'); // test server which in turn loads our module

test("Attempt to access restricted content (without auth token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado"
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No Token should fail");
    t.end();
  });
});

test("Attempt to access restricted content (with an INVALID Token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer fails.validation" }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});

test("Malformed JWT", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  // console.log(token);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer my.invalid.token" }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(response.result);
    // console.log(' '); // blank line
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    // t.equal(JSON.parse(response.result).msg, 'Invalid Token', "INVALID Token should fail");
    t.end();
  });
});

test("Try using a token with missing characters in body", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  // delete some characters in body
  var tokenData = token.split('.');
  var header = tokenData[0],
      body = tokenData[1],
      signature = tokenData[2];
  token = header + '.' + body.substring(0, body.length - 1) + '.' + signature;
  /*console.log(" - - - - - - token  - - - - -");
  console.log(token);*/
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});

test("Try using an incorrect secret to sign the JWT", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'incorrectSecret');
  // console.log(" - - - - - - token  - - - - -")
  // console.log(token);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token  }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Token signed with incorrect key fails");
    t.end();
  });
});

// see: https://github.com/dwyl/hapi-auth-jwt2/issues/166
// test.only("Try using an expired token", function(t) {
//   // use the token as the 'authorization' header in requests
//   var token = JWT.sign({ id: 123, "name": "Charlie" }, secret, { expiresInSeconds: 1 });
//   console.log(" - - - - - - token  - - - - -")
//   console.log(token);
//   var options = {
//     method: "POST",
//     url: "/privado",
//     headers: { authorization: "Bearer " + token  }
//   };
//   // server.inject lets us simulate an http request
//   setTimeout(function () {
//     server.inject(options, function(response) {
//       t.equal(response.statusCode, 401, "Expired token should be invalid");
//       t.equal(response.result.message, 'Token expired', 'Message should be "Token expired"');
//       t.end();
//     });
//   }, 1000);
// });

test("Token is well formed but is allowed=false so should be denied", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  var token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Denied");
    t.end();
  });
});

test("Access restricted content (with VALID Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});

test("Access restricted content (with Well-formed but invalid Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 401, "InVALID Token should Error!");
    t.end();
  });
});

// see: https://github.com/ideaq/hapi-auth-jwt2/issues/28
test("Request with undefined auth header should 401", function(t) {
  var options = {
    method: "POST",
    url: "/privado",
    headers: { authorization: "Bearer " }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 401, "InVALID Token fails (as expected)!");

    t.end();
  });
});

test("Auth mode 'required' should require authentication header", function(t) {
  var options = {
    method: "POST",
    url: "/required"
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No token header should fail in auth 'required' mode");
    t.end();
  });
});

test("Auth mode 'required' should fail with invalid token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/required",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});

test("Auth mode 'required' should should pass with valid token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/required",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});

test("Auth mode 'optional' should pass when no auth header specified", function(t) {
  var options = {
    method: "POST",
    url: "/optional"
  };
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "No auth header should pass in optional mode!");
    t.end();
  });
});

test("Auth mode 'optional' should fail with invalid token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/optional",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});

test("Auth mode 'optional' should pass with valid token", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/optional",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});

test("Auth mode 'try' should pass when no auth header specified", function(t) {
  var options = {
    method: "POST",
    url: "/try"
  };
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "No auth header should pass in 'try' mode!");
    t.end();
  });
});

test("Auth mode 'try' should pass with invalid token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'badsecret');
  var options = {
    method: "POST",
    url: "/try",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "Invalid token should pass in 'try' mode");
    t.end();
  });
});

test("Auth mode 'try' should pass with valid token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "POST",
    url: "/try",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response);
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});

test("Scheme should set token in request.auth.token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  var options = {
    method: "GET",
    url: "/token",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.result, token, 'Token is accesible from handler');
    t.end();
  });
});

test.onFinish(function () {
  server.stop(function(){});
})
