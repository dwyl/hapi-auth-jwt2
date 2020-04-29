const Hapi = require('@hapi/hapi');
const secret = 'NeverShareYourSecret';
const Boom = require('@hapi/boom');

// for debug options see: http://hapijs.com/tutorials/logging
const server = new Hapi.server({ debug: false });

// payload is not available to validate, so payloadFunc offers a chance use it for validation
const payloadFunction = function (req, h) {
    if (req.auth.credentials.id !== req.payload.id) throw Boom.unauthorized("You don't have authorization");

    return h.continue;
}

const payloadAsyncFunction = async function (req, h) {
    await new Promise(resolve => setTimeout(() => resolve(), 200));
    return payloadFunction(req, h);
}

const init = async () => {

    await server.register(require('../'));

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validate: () => ({ isValid: true }),
        payloadFunc: payloadFunction,
    });

    server.auth.strategy('asyncJwt', 'jwt', {
        key: secret,
        validate: () => ({ isValid: true }),
        payloadFunc: payloadAsyncFunction
    });

    server.auth.strategy('noPayloadJwt', 'jwt', {
        key: secret,
        validate: () => ({ isValid: true }),
        payload: true
    });

    server.route([
        {
            method: 'POST',
            path: '/',
            handler: () => 'Hi',
            options: {
                auth: {
                    mode: 'required',
                    strategy: 'jwt',
                    payload: 'required',
                },
            }
        },
        {
            method: 'POST',
            path: '/async',
            handler: () => 'Hi',
            options: {
                auth: {
                    mode: 'required',
                    strategy: 'asyncJwt',
                    payload: 'required',
                },
            }
        },
        {
            method: 'POST',
            path: '/noPayload',
            handler: () => 'Hi',
            options: {
                auth: {
                    mode: 'required',
                    strategy: 'noPayloadJwt',
                    payload: 'required',
                },
            }
        }
    ]);

};

init();

module.exports = server;
