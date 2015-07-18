var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var server = require('./server.js');

test("Access restricted content (with VALID Token) as Cookie", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id:123,"name":"Charlie" }, secret);
  // token = "?token="+token
  var options = {
    method: "POST",
    url: "/privado",
    headers: { cookie : token }
  };
  console.log(' - - - - - - - - - OPTIONS - - - - - - - - - ');
  console.log(options);
  console.log(' - - - - - - - - - OPTIONS - - - - - - - - - \n');
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    console.log(response.headers)
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});
