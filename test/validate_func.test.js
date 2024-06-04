const test = require('tape');
const JWT = require('jsonwebtoken');
const secret = 'NeverShareYourSecret';

const server = require('./validate_func_server'); // test server which in turn loads our module

test('Should respond with 500 when validate function throws an error', async function (t) {
  let options = {
    method: 'POST',
    url: '/privado',
    headers: { Authorization: JWT.sign({ id: 138, name: 'Test' }, secret) },
  };

  let response = await server.inject(options);
  t.equal(response.statusCode, 500, 'Server returned 500 for validate error');
  t.end();
});

test('Should redirect when validate function returns a response object with redirect', async function (t) {
  let options = {
    method: 'POST',
    url: '/privado',
    headers: { Authorization: JWT.sign({ id: 200, name: 'Test' }, secret) },
  };

  let response = await server.inject(options);
  t.equal(response.statusCode, 302, 'Server redirected successfully');
  t.equal(
    response.headers.location,
    'https://dwyl.com',
    'Server redirected to correct URL'
  );
  t.end();
});

test('Should respond with 401 when validate function returns isValid false', async function (t) {
  let options = {
    method: 'POST',
    url: '/privado',
    headers: { Authorization: JWT.sign({ id: 139, name: 'Test' }, secret) },
  };

  let response = await server.inject(options);
  t.equal(
    response.statusCode,
    401,
    'Server returned 401 for invalid credentials'
  );
  t.equal(
    response.result.message,
    'Invalid credentials',
    'Default error message for invalid credentials'
  );
  t.end();
});

test('Should respond with custom error message when validate function returns custom errorMessage', async function (t) {
  let options = {
    method: 'POST',
    url: '/privado',
    headers: { Authorization: JWT.sign({ id: 140, name: 'Test' }, secret) },
  };

  let response = await server.inject(options);
  t.equal(response.statusCode, 401, 'Server returned 401 for custom error');
  t.equal(
    response.result.message,
    'Bad ID',
    'Custom error message for invalid credentials'
  );
  t.end();
});

test('Should respond with non-generic error message when validate function throws a non-server error', async function (t) {
  let options = {
    method: 'POST',
    url: '/privado',
    headers: { Authorization: JWT.sign({ id: 141, name: 'Test' }, secret) },
  };

  let response = await server.inject(options);
  t.equal(
    response.statusCode,
    404,
    'Server returned 404 for resource not found'
  );
  t.equal(
    response.result.message,
    'Resource not found',
    'Error message for resource not found'
  );
  t.end();
});
