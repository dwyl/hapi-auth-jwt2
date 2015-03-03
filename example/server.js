var Hapi        = require('hapi');
var hapiAuthJWT = require('../lib/');
var jwt         = require('jsonwebtoken');
var port        = process.env.PORT || 8000;

var secret = 'NeverShareThisYourSecret'; // Never Share This! even in private GitHub repos!

var people = {
    1: {
      id: 1,
      name: 'Anthony Valid User'
    }
};

// use the token as the 'authorization' header in requests
var token = jwt.sign(people[1], secret);

// defining our own validate function lets us do something
// useful/custom with the decodedToken before reply(ing)
var validate = function (decoded, callback) {

    console.log(decoded); //

    if (!people[decoded.id]) { // invalid person
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
    server.auth.strategy('jwt', 'jwt', true, { key: secret,  validateFunc: validate });

    server.route({
      // GET http://localhost:8000/private (Auth Token Required)
      // curl -H "Authorization: <TOKEN>" http://localhost:8000/private
      /** example:
curl -v -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGhvbnkgVmFsaWQgVXNlciIsImlhdCI6MTQyNTQxMTA0Nn0.HUlnTh_LMQSJmfBB3OVqThypm0nnyQjm5jbrAKDgOhI" \
http://localhost:8000/private
      */
      method: 'GET',
      path: '/private',
      config: { auth: 'jwt' },
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
