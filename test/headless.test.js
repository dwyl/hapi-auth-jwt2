const test   = require('tape');
const JWT    = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

const server = require('./basic_server'); // test server which in turn loads our module

test("Attempt to access headless without token", async function(t) {
    const options = {
        method: "POST",
        url: "/headless"
    };
    // server.inject lets us simulate an http request
    const response = await server.inject(options);
    t.equal(response.statusCode, 401, "No Token should fail");
    t.end();
});


test("Attempt to access restricted content (with an headless INVALID Token)", async function(t) {
    const options = {
        method: "POST",
        url: "/headless",
        headers: { authorization: "Bearer fails.validation" }
    };
    // server.inject lets us simulate an http request
    const response = await server.inject(options);
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
});

test("Access restricted content (with VALID headless Token)", async function(t) {
    // use the token as the 'authorization' header in requests
    let token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
    token = token.substring(token.indexOf(".") + 1);

    const options = {
        method: "POST",
        url: "/headless",
        headers: { authorization: "Bearer " + token }
    };
    // server.inject lets us simulate an http request
    const response = await server.inject(options);
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
});

test("Access restricted content (with VALID Token and headless enabled)", async function(t) {
    // use the token as the 'authorization' header in requests
    let token = JWT.sign({ id: 123, "name": "Charlie" }, secret);

    const options = {
        method: "POST",
        url: "/headless",
        headers: { authorization: "Bearer " + token }
    };
    // server.inject lets us simulate an http request
    const response = await server.inject(options);
    // console.log(" - - - - RESPONSE: ")
    // console.log(response.result);
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
});