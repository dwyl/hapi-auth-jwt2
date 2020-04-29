const Hapi        = require('@hapi/hapi');
const hapiAuthJWT = require('../lib/');
const JWT         = require('jsonwebtoken');  // used to sign our content
const port        = process.env.PORT || 8000; // allow port to be set

const secret = 'NeverShareYourSecret'; // Never Share This! even in private GitHub repos!

const people = {
    1: {
      id: 1,
      name: 'Anthony Valid User'
    }
};

// use the token as the 'authorization' header in requests
const token = JWT.sign(people[1], secret); // synchronous
console.log(token);
// bring your own validation function
const validate = async function (decoded, request, h) {
  console.log(" - - - - - - - decoded token:");
  console.log(decoded);
  console.log(" - - - - - - - request info:");
  console.log(request.info);
  console.log(" - - - - - - - user agent:");
  console.log(request.headers['user-agent']);

  // do your checks to see if the person is valid
  if (!people[decoded.id]) {
    return { isValid: false };
  }
  else {
    return { isValid : true };
  }
};

const init = async() => {
  const server = new Hapi.server({ port: port });
  await server.register(hapiAuthJWT);
  // see: http://hapijs.com/api#serverauthschemename-scheme
  server.auth.strategy('jwt', 'jwt',
  { key: secret,
    validate,
    verifyOptions: { ignoreExpiration: true }
  });

  server.auth.default('jwt');

  server.route([
    {
      method: "GET", path: "/", config: { auth: false },
      handler: function(request, h) {
        return {text: 'Token not required'};
      }
    },
    {
      method: 'GET', path: '/restricted', config: { auth: 'jwt' },
      handler: function(request, h) {
        const response = h.response({message: 'You used a Valid JWT Token to access /restricted endpoint!'});
        response.header("Authorization", request.headers.authorization);
        return response;
      }
    }
  ]);
  await server.start();
  return server;
  
  
};

init().then(server => {
  console.log('Server running at:', server.info.uri);
}).catch(err => {
  console.log(err);
});
  
