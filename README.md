# Hapi Auth with JSON Web Tokens (JWT)

The ***simplest*** authentication scheme/plugin for
[Hapi.js](http://hapijs.com/) apps using JSON Web Tokens.

[![Node.js Version][node-version-image]][node-version-url]
[![NPM Version][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/ideaq/hapi-auth-jwt2.svg)](https://travis-ci.org/ideaq/hapi-auth-jwt2)
[![Test Coverage](https://codeclimate.com/github/ideaq/hapi-auth-jwt2/badges/coverage.svg)](https://codeclimate.com/github/ideaq/hapi-auth-jwt2)
[![Code Climate](https://codeclimate.com/github/ideaq/hapi-auth-jwt2/badges/gpa.svg)](https://codeclimate.com/github/ideaq/hapi-auth-jwt2)
[![Dependency Status](https://david-dm.org/ideaq/hapi-auth-jwt2.svg)](https://david-dm.org/ideaq/hapi-auth-jwt2)

## Usage

### Install from NPM

```sh
npm install hapi-auth-jwt2 --save
```

### Example

basic usage example to get started:

```javascript
var Hapi        = require('hapi');
var JWT         = require('jsonwebtoken');  // used to sign our content
var port        = process.env.PORT || 8000; // allow port to be set

var secret = 'NeverShareYourSecret'; // Never Share This! even in private GitHub repos!

var people = { // our "users databse"
    1: {
      id: 1,
      name: 'Anthony Valid User'
    }
};

// use the token as the 'authorization' header in requests
var token = JWT.sign(people[1], secret); // synchronous

// bring your own validation function
var validate = function (decoded, callback) {

    console.log(decoded);

    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
      return callback(null, false);
    }
    else {
      return callback(null, true);
    }
};

var server = new Hapi.Server();
server.connection({ port: port });
        // include our module here ↓↓
server.register(require('hapi-auth-jwt2'), function (err) {

    if(err){
      console.log(err);
    }
    // see: http://hapijs.com/api#serverauthschemename-scheme
    server.auth.strategy('jwt', 'jwt', true, { key: secret,  validateFunc: validate });

    server.route([
      {
        method: "GET", path: "/", config: { auth: false },
        handler: function(request, reply) {
          reply({text: 'Token not required'});
        }
      },
      {
        method: 'GET', path: '/restricted', config: { auth: 'jwt' },
        handler: function(request, reply) {
          reply({text: 'You used a Token!'}).header("Authorization", request.headers.authorization);
        }
      }
    ]);
});

server.start();
```

Run the server with: `node example/server.js`

Now use **curl** to access the two routes:

#### No Token Required

```sh
curl -v http://localhost:8000/
```

#### Token Required

Try to access the /*restricted* content *without* supplying a Token
(*expect* to see a ***401 error***):
```sh
curl -v http://localhost:8000/restricted
```

Now access the url using the following format:
`curl -H "Authorization: <TOKEN>" http://localhost:8000/restricted`

A here's a *valid* token you can use (*copy-paste* this command):
```sh
curl -v -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGhvbnkgVmFsaWQgVXNlciIsImlhdCI6MTQyNTQ3MzUzNX0.KA68l60mjiC8EXaC2odnjFwdIDxE__iDu5RwLdN1F2A" \
http://localhost:8000/restricted
```

That's it.

Write your own `validateFunc` with what ever checks you want to perform
on the **decoded** token before allowing the visitor to proceed.

## Documentation

- `validateFunc` - (***required***) a the function which is run once the Token has been decoded
 signature `function(decoded, callback)` where:
    - `decoded` - is the ***decoded*** JWT received from the client in **request.headers.authorization**
    - `callback` - (***required***) a callback function with the signature `function(err, isValid)` where:
        - `err` - an internal error.
        - `valid` - `true` if the JWT was valid, otherwise `false`.


- - -

## Motivation

While making [***Time***](https://github.com/ideaq/time) we want to ensure
our app (and API) is as ***simple*** as *possible* to use.  
This lead us to using JSON Web Tokens for ***Stateless*** Authentication.

We did a *extensive* [research](https://www.npmjs.com/search?q=hapi+auth+jwt)
into *existing* modules that *might* solve our problem; there are *many* on NPM:
![npm search for hapi+jwt](http://i.imgur.com/xIj3Xpa.png)

but they were invariably ***too complicated***, poorly documented and
had *useless* (non-real-world) "examples"!  
So we decided to write our own addressing all these issues.

*Don't take our word for it, do your own homework and decide which module you prefer.*

### *Guiding Principal*

> "* **perfection** is **attained** not when there is nothing more to add,  
> but when there is **nothing more to remove** * " ~
[Antoine de Saint-Exupéry](http://en.wikiquote.org/wiki/Antoine_de_Saint_Exup%C3%A9ry)



## Why hapi-auth-jwt2 ?

The name we wanted was taken.  
Think of our module as the "***new and simplified version***" :wink:

## Useful Links

For more background on JWT see our post:
https://github.com/docdis/learn-json-web-tokens

### Hapi.js Auth

We borrowed code from the following:

+ http://hapijs.com/tutorials/auth
+ https://github.com/hapijs/hapi-auth-basic
+ https://github.com/hapijs/hapi-auth-cookie
+ https://github.com/hapijs/hapi-auth-hawk



[npm-image]: https://img.shields.io/npm/v/hapi-auth-jwt2.svg?style=flat
[npm-url]: https://npmjs.org/package/hapi-auth-jwt2
[node-version-image]: https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat
[node-version-url]: http://nodejs.org/download/
