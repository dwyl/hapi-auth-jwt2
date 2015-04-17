# Hapi Auth with JSON Web Tokens (JWT)

The ***simplest*** authentication scheme/plugin for
[Hapi.js](http://hapijs.com/) apps using JSON Web Tokens.

[![Build Status](https://travis-ci.org/ideaq/hapi-auth-jwt2.svg "Build Status = Tests Passing")](https://travis-ci.org/ideaq/hapi-auth-jwt2)
[![Test Coverage](https://codeclimate.com/github/ideaq/hapi-auth-jwt2/badges/coverage.svg "All Lines Tested")](https://codeclimate.com/github/ideaq/hapi-auth-jwt2)
[![Code Climate](https://codeclimate.com/github/ideaq/hapi-auth-jwt2/badges/gpa.svg "No Nasty Code")](https://codeclimate.com/github/ideaq/hapi-auth-jwt2)
[![Dependency Status](https://david-dm.org/ideaq/hapi-auth-jwt2.svg "Dependencies Checked & Updated Regularly (Security is Important!)")](https://david-dm.org/ideaq/hapi-auth-jwt2)
[![Node.js Version](https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat "Node.js 10 & 12 and io.js latest both supported")](http://nodejs.org/download/)
[![NPM Version](https://badge.fury.io/js/hapi-auth-jwt2.svg?style=flat)](https://npmjs.org/package/hapi-auth-jwt2)
[![HAPI 8.4](http://img.shields.io/badge/hapi-8.4-brightgreen.svg "Latest Hapi.js")](http://hapijs.com)


This node.js module (Hapi plugin) lets you use JSON Web Tokens (JWTs)
for authentication in your [Hapi.js](http://hapijs.com/)
web application.

If you are totally new to JWTs, we wrote an introductory post explaining  
the concepts & benefits: https://github.com/docdis/learn-json-web-tokens

If you (or anyone on your team) are unfamiliar with **Hapi.js** we have a  
quick guide for that too: https://github.com/nelsonic/learn-hapi

## Usage

We have tried to make this plugin a user (developer) friendly as possible,
but if anything is unclear,  
please submit any questions as issues on GitHub:
https://github.com/ideaq/hapi-auth-jwt2/issues

### Install from NPM

```sh
npm install hapi-auth-jwt2 --save
```

### Example

This basic usage example should get started:


```javascript
var Hapi = require('hapi');

var people = { // our "users database"
    1: {
      id: 1,
      name: 'Jen Jones'
    }
};

// bring your own validation function
var validate = function (decoded, request, callback) {

    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
      return callback(null, false);
    }
    else {
      return callback(null, true);
    }
};

var server = new Hapi.Server();
server.connection({ port: 8000 });
        // include our module here ↓↓
server.register(require('hapi-auth-jwt2'), function (err) {

    if(err){
      console.log(err);
    }

    server.auth.strategy('jwt', 'jwt', true,
    { key: 'NeverShareYourSecret', // Never Share your secret key
      validateFunc: validate       // validate function defined above
    });

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
          reply({text: 'You used a Token!'})
          .header("Authorization", request.headers.authorization);
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

### Real World Example ?

If you would like to see a "***real world example***" of this plugin in use
in a ***production*** web app (API)
please see: https://github.com/ideaq/time/tree/master/api/lib

+ **app.js** ***registering*** the **hapi-auth-jw2 plugin**:
[app.js#L13](https://github.com/ideaq/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js#L13)
+ telling app.js where to find our **validateFunc**tion:
[app.js#L21](https://github.com/ideaq/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js#L21)
+ **validateFunc**tion (how we check the JWT is still valid):
[api/lib/auth_jwt_validate.js](https://github.com/ideaq/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_validate.js) looks up the person's session in our ElasticSearch Database
if the [session record is ***found*** (valid) and ***not ended***](https://github.com/ideaq/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_validate.js#L12) we allow the person to see the restricted content.
+ **Signing your JWTs**: in your app you need a method to *sign* the JWTs (and put them in a database
  if that's how you are *verifying* your sessions) ours is:
  [api/lib/auth_jwt_sign.js](https://github.com/ideaq/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_sign.js#L18)

If you have ***any questions*** on this please post an issue/question on GitHub:
https://github.com/ideaq/hapi-auth-jwt2/issues  
(*we are here to help get you started on your journey to **hapi**ness!*)

## Documentation

- `validateFunc` - (***required***) a the function which is run once the Token has been decoded
 signature `function(decoded, request, callback)` where:
    - `decoded` - (***required***) is the ***decoded*** JWT received from the client in **request.headers.authorization**
    - `request` - (***required***) is the original ***request*** received from the client  
    - `callback` - (***required***) a callback function with the signature `function(err, isValid)` where:
        - `err` - an internal error.
        - `valid` - `true` if the JWT was valid, otherwise `false`.

### verifyOptions let you define how to Verify the Tokens (*Optional*)

While registering the **hapi-auth-jwt2** plugin you can define
the following **verifyOptions**:

*  `ignoreExpiration` - ignore expired tokens
*  `audience` - do not enforce token [*audience*](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#audDef)
*  `issuer` - do not require the issuer to be valid

example:
```js
server.auth.strategy('jwt', 'jwt', true,
{ key: 'NeverShareYourSecret', // Never Share your secret key
  validateFunc: validate,      // validate function defined above
  verifyOptions: { ignoreExpiration: true }  // do not reject expired tokens
});
```

Read more about this at: [jsonwebtoken verify options]( https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

If you prefer *not* to use any of these verifyOptions simply
do not set them when registering the plugin with your app;
they are all optional.

This feature was requested in: [issues/29](https://github.com/ideaq/hapi-auth-jwt2/issues/29)

<!--
# Production Ready Example Code

redis://rediscloud:OhEJHaKRrjWvSgna@pub-redis-10689.eu-west-1-2.1.ec2.garantiadata.com:10689
-->

=======
This feature was requested in: [issues/29](https://github.com/ideaq/hapi-auth-jwt2/issues/29)

- - -

## Frequently Asked Questions (FAQ)

1. Do I need to include **jsonwebtoken** in my project? asked in  [hapi-auth-jwt2/issues/32](https://github.com/ideaq/hapi-auth-jwt2/issues/32)  
**Q**: Must I include the **jsonwebtoken** package in my project
[given that **hapi-auth-jwt2** plugin already includes it] ?  
**A**: Yes, you need to *manually* install the **jsonwebtoken**
node module from NPM with `npm install jsonwebtoken --save` if you want to ***sign*** JWTs in your app.  
Even though **hapi-auth-jwt2** includes it
as a **dependency** your app does not know where to find it in the **node_modules** tree for your project.  
Unless you include it via ***relative path*** e.g:
`var JWT = require('./node_modules/hapi-auth-jwt2/node_modules/jsonwebtoken');`  
we *recommend* including it in your **package.json** ***explicitly*** as a **dependency** for your project.

> *If you have a question, **please post an issue**/question on **GitHub***:
https://github.com/ideaq/hapi-auth-jwt2/issues

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

Also, none of the *existing* modules exposed the **request** object
to the **validateFunc** which we thought might be handy.

So we decided to write our own module addressing all these issues.

*Don't take our word for it, do your own homework and decide which module you prefer.*

### *Guiding Principal*

> "***perfection*** *is* ***attained*** *not when there is nothing more to add,  
> but when there is* ***nothing more to remove***" ~
[Antoine de Saint-Exupéry](http://en.wikiquote.org/wiki/Antoine_de_Saint_Exup%C3%A9ry#Quotes)



## Why hapi-auth-jwt2 ?

The name we wanted was taken.  
Think of our module as the "***new, simplified and actively maintained version***"

## Useful Links

For more background on JWT see our post:
https://github.com/docdis/learn-json-web-tokens

### Hapi.js Auth

We borrowed code from the following:

+ http://hapijs.com/tutorials/auth
+ https://github.com/hapijs/hapi-auth-basic
+ https://github.com/hapijs/hapi-auth-cookie
+ https://github.com/hapijs/hapi-auth-hawk
+ https://github.com/ryanfitz/hapi-auth-jwt
(Ryan has made a good *starting point* - we tried to submit a [pull request](https://github.com/ryanfitz/hapi-auth-jwt/pull/27)  
to improve it but got *ignored* ... an *authentication* plugin that [***ignores
  security updates***](https://github.com/ryanfitz/hapi-auth-jwt/issues/26) in [dependencies](https://david-dm.org/ryanfitz/hapi-auth-jwt)
  is a ***no-go*** for us; **security *matters***!)
