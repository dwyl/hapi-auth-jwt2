const Hapi = require('hapi');

const people = { // our "users database"
    1: {
      id: 1,
      name: 'Jen Jones'
    }
};

// bring your own validation function
const validate = async function (decoded, request, h) {

    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
      return { valid: false };
    }
    else {
      return { valid: true };
    }
};

const init = async () => {
  const server = new Hapi.Server({ port: 8000 });
  // include our module here ↓↓
  await server.register(require('../lib'));
  server.auth.strategy('jwt', 'jwt',
  { key: 'NeverShareYourSecret', // Never Share your secret key
    validate  // validate function defined above
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
        const response = h.response({text: 'You used a Token!'});
        response.header("Authorization", request.headers.authorization);
        return response;
      }
    }
  ]);
  await server.start();
  return server;
}
init().then(server => {
  console.log('Server running at:', server.info.uri);
})
.catch(err => {
  console.log(err);
});
