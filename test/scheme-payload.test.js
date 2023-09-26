// const test = require('tape');
const tap = require('tap');
const test = tap.test;
const JWT = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';
const Boom = require('@hapi/boom');

const server = require('./scheme-payload-server');

const mismatchTest = async function(url, t) {
    const token = JWT.sign({ id: 123 }, secret);
    const options = {
        method: "POST",
        url,
        payload: { id: 124 },
        headers: { authorization: "Bearer " + token }
    };

    const response = await server.inject(options);
    const expected = Boom.unauthorized("You don't have authorization");
    t.equal(response.payload, JSON.stringify(expected.output.payload), "Mismatch should fail");
};

const matchingTest = async function (url, t) {
    const token = JWT.sign({ id: 123 }, secret);
    const options = {
        method: "POST",
        url: "/",
        payload: { id: 123 },
        headers: { authorization: "Bearer " + token }
    };

    const response = await server.inject(options);
    t.equal(response.payload, 'Hi', "Matching pass");
};

test("No payload function", async function (t) {
    const token = JWT.sign({ id: 123 }, secret);
    const options = {
        method: "POST",
        url: '/noPayload',
        payload: { id: 124 },
        headers: { authorization: "Bearer " + token }
    };

    const response = await server.inject(options);
    t.equal(response.result.statusCode, 404);
    t.end();
});

test("Mismatch payload info required for auth", async function (t) {
    await mismatchTest('/', t);
});

test("Matching payload info required for auth", async function (t) {
    await matchingTest('/', t);
});

test("Mismatch payload info required for auth (async)", async function (t) {
    await mismatchTest('/async', t);
});

test("Matching payload info required for auth (async)", async function (t) {
    await matchingTest('/async', t);
});
