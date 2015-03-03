var Hapi        = require('hapi');
var hapiAuthJWT = require('../lib/');
var jwt         = require('jsonwebtoken');
var port        = process.env.PORT || 8000;

// console.log(hapiAuthJWT);

var secret = 'NeverShareThisYourSecret'; // Never Share This! even in private GitHub repos!

var accounts = {
    123: {
      id: 123,
      user: 'john',
      fullName: 'John Q Public'
    }
};

// use the token as the 'authorization' header in requests
var token = jwt.sign({ id: 123 }, secret);

console.log('Token: ' + token);
//
var validate = function (decodedToken, callback) {

    console.log(decodedToken);  // should be {id : 123}.

    if (decodedToken) {
      console.log(decodedToken.id);
    }

    var account = accounts[decodedToken.id];

    if (!account) {
      return callback(null, false);
    }

    return callback(null, true);
};

var server = new Hapi.Server();
server.connection({ port: port });

server.register(hapiAuthJWT, function (err) {

    if(err){
      console.log(err);
    }

    // see: http://hapijs.com/api#serverauthschemename-scheme
    server.auth.strategy('token', 'jwt', true, { key: secret,  validateFunc: validate });

    server.route({
      // GET http://localhost:8000/private (Auth Token Required)
      // curl -H "Authorization: <TOKEN>" http://localhost:8000/private
      /**
curl -v -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTIzLCJpYXQiOjE0MjU0MDQwNzh9.wJDTj0eVxY860UPmRS8oU48qRcAjK8WsC3NzdmwEsBQ" \
http://localhost:8000/private
      */
      method: 'GET',
      path: '/private',
      config: { auth: 'token' },
      handler: function(request, reply) {
        var replyObj = {
          text: 'You used a Token! :-)'
          // credentials: request.auth.credentials
        };
        reply(replyObj).header("Authorization", request.headers.authorization);
      }
    });

    server.route({
      // GET to http://localhost:8000/ (No Auth Token Required)
      // This get can be executed without sending any token at all
      method: "GET",
      path: "/",
      config: { auth: false },
      handler: function(request, reply) {
        var replyObj = {text: 'Token not required'};
        reply(replyObj);
      }
    });

});

server.start();
