# Hapi Auth with JSON Web Tokens (JWT)

***The*** authentication scheme/plugin for
[**Hapi.js**](http://hapijs.com/) apps using **JSON Web Tokens**

[![Build Status](https://travis-ci.org/dwyl/hapi-auth-jwt2.svg "Build Status = Tests Passing")](https://travis-ci.org/dwyl/hapi-auth-jwt2)
[![Test Coverage](https://codeclimate.com/github/dwyl/hapi-auth-jwt2/badges/coverage.svg "All Lines Tested")](https://codeclimate.com/github/dwyl/hapi-auth-jwt2)
[![Code Climate](https://codeclimate.com/github/dwyl/hapi-auth-jwt2/badges/gpa.svg "No Nasty Code")](https://codeclimate.com/github/dwyl/hapi-auth-jwt2)
[![bitHound Score](https://www.bithound.io/github/dwyl/hapi-auth-jwt2/badges/score.svg)](https://www.bithound.io/github/dwyl/hapi-auth-jwt2)
[![Dependency Status](https://david-dm.org/dwyl/hapi-auth-jwt2.svg "Dependencies Checked & Updated Regularly (Security is Important!)")](https://david-dm.org/dwyl/hapi-auth-jwt2)
[![Node.js Version](https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat "Node.js 10 & 12 and io.js latest both supported")](http://nodejs.org/download/)
[![npm](https://img.shields.io/npm/v/hapi-auth-jwt2.svg)](https://www.npmjs.com/package/hapi-auth-jwt2)
[![HAPI 8.8](http://img.shields.io/badge/hapi-8.8-brightgreen.svg "Latest Hapi.js")](http://hapijs.com)


This node.js module (Hapi plugin) lets you use JSON Web Tokens (JWTs)
for authentication in your [Hapi.js](http://hapijs.com/)
web application.

If you are totally new to JWTs, we wrote an introductory post explaining  
the concepts & benefits: https://github.com/dwyl/learn-json-web-tokens

If you (or anyone on your team) are unfamiliar with **Hapi.js** we have a  
quick guide for that too: https://github.com/nelsonic/learn-hapi

## Usage

We tried to make this plugin as user (developer) friendly as possible,
but if anything is unclear, please submit any questions as issues on GitHub:
https://github.com/dwyl/hapi-auth-jwt2/issues

### Install from NPM

```sh
npm install hapi-auth-jwt2 --save
```

### Example

This basic usage example should help you get started:


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
    { key: 'NeverShareYourSecret',          // Never Share your secret key
      validateFunc: validate,            // validate function defined above
      verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
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

## Documentation

- `key` - (***required***) the secret key used to check the signature of the token or a key lookup function with
signature `function(decoded, callback)` where:
    - `decoded` - the ***decoded*** but ***unverified*** JWT received from client
    - `callback` - callback function with the signature `function(err, key, extraInfo)` where:
        - `err` - an internal error
        - `key` - the secret key
        - `extraInfo` - (***optional***) any additional information that you would like to use in
        `validateFunc` which can be accessed via `request.plugins['hapi-auth-jwt2'].extraInfo`
- `validateFunc` - (***required***) the function which is run once the Token has been decoded with
 signature `function(decoded, request, callback)` where:
    - `decoded` - (***required***) is the ***decoded*** and ***verified*** JWT received from the client in **request.headers.authorization**
    - `request` - (***required***) is the original ***request*** received from the client  
    - `callback` - (***required***) a callback function with the signature `function(err, isValid, credentials)` where:
        - `err` - an internal error.
        - `valid` - `true` if the JWT was valid, otherwise `false`.
        - `credentials` - (***optional***) alternative credentials to be set instead of `decoded`.
- `verifyOptions` - (***optional***) settings to define how tokens are verified by jsonwebtoken library
    - `ignoreExpiration` - ignore expired tokens
    - `audience` - do not enforce token [*audience*](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#audDef)
    - `issuer` - do not require the issuer to be valid
    - `algorithms` - list of allowed algorithms
- `url tokens` - if you prefer to pass your token in via url, simply add a `token` url parameter to your reqest.
- `cookie token` - If you prefer to use cookies in your hapi.js app,
simply set the cookie `token=your.jsonwebtoken.here`

### verifyOptions let you define how to Verify the Tokens (*Optional*)

example:
```js
server.auth.strategy('jwt', 'jwt', true,
{ key: 'NeverShareYourSecret', // Never Share your secret key
  validateFunc: validate,      // validate function defined above
  verifyOptions: {
    ignoreExpiration: true,    // do not reject expired tokens
    algorithms: [ 'HS256' ]    // specify your secure algorithm
  }
});
```

Read more about this at: [jsonwebtoken verify options]( https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

### Specify Signing Algorithm (_Optional but highly recommended_)

For [security reasons](https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/) it is recommended that you specify the allowed algorithms used when signing the tokens:
```js
server.auth.strategy('jwt', 'jwt', true,
{ key: 'YourSuperLongKeyHere', // Never Share your secret key
  validateFunc: validate,      // validate function defined above
  verifyOptions: { algorithms: [ 'HS256' ] }  // only allow HS256 algorithm
});
```

If you prefer *not* to use any of these verifyOptions simply
do not set them when registering the plugin with your app;
they are all optional.

This feature was requested in: [issues/29](https://github.com/dwyl/hapi-auth-jwt2/issues/29)

### Authentication Modes

This plugin supports [authentication modes](http://hapijs.com/api#route-options) on routes.

- `required` - requires Authorization header to be sent with every request

- `optional` - if no Authorization header is provided, request will pass with `request.auth.isAuthenticated` set to `true` and `request.auth.credentials` set to empty object

- `try` - similar to `optional` but invalid Authorization header will pass with `request.auth.isAuthenticated` set to false and failed credentials provided in `request.auth.credentials`

### Additional notes on key lookup functions

- This option to look up a secret key was added to support "multi-tenant" environments. One use case would be companies that white label API services for their customers and cannot use a shared secret key.

- The reason why you might want to pass back `extraInfo` in the callback is because you likely need to do a database call to get the key which also probably returns useful user data. This could save you another call in `validateFunc`.

## URL (URI) Token

Several people requested the ability pass in JSNOWebTokens via request URL:
https://github.com/dwyl/hapi-auth-jwt2/issues/19

### Usage

Setup your hapi.js server as described above (_no special setup for using jwt tokens in urls_)

```sh
https://yoursite.co/path?token=your.jsonwebtoken.here
```
You will need to generage valid tokens for this to work.

```js
var JWT   = require('jsonwebtoken');
var obj   = { id:123,"name":"Charlie" }; // object/info you want to sign
var token = JWT.sign(obj, secret);
var url   = "/path?token="+token;
```

## Generating Your Secret Key

@skota asked "_How to generate secret key_?" in: https://github.com/dwyl/hapi-auth-jwt2/issues/48

There are _several_ options for generating secret keys.
The _easist_ way is to simply copy paste a _**strong random string**_ of alpha-numeric characters from https://www.grc.com/passwords.htm
(_if you want a longer key simply refresh the page and copy-paste multiple random strings_)

## Want to send/store your JWT in a Cookie?

[@benjaminlees](https://github.com/benjaminlees)
requested the ability to send tokens as cookies:
https://github.com/dwyl/hapi-auth-jwt2/issues/55  
So we added the ability to *optionally* send/store your tokens in cookies
to simplify building your *web app*.

To enable cookie support in your application all you need to do is add
a few lines to your code:

### Cookie Options

Firstly set the options you want to apply to your cookie:

```js
var cookie_options = {
  ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today
  encoding: 'none',    // we already used JWT to encode
  isSecure: true,      // warm & fuzzy feelings
  isHttpOnly: true,    // prevent client alteration
  clearInvalid: false, // remove invalid cookies
  strictHeader: true   // don't allow violations of RFC 6265
}
```

### Set the Cookie on your `reply`

Then, in your authorisation handler

```js
reply({text: 'You have been authenticated!'})
.header("Authorization", token)        // where token is the JWT
.state("token", token, cookie_options) // set the cookie with options
```

For a detailed example please see:
https://github.com/nelsonic/hapi-auth-jwt2-cookie-example

### Background Reading

+ Wikipedia has a good intro (general): https://en.wikipedia.org/wiki/HTTP_cookie
+ Cookies Explained (by Nicholas C. Zakas - JavaScript über-master) http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
+ The Unofficial Cookie FAQ: http://www.cookiecentral.com/faq/
+  HTTP State Management Mechanism (long but complete spec):
http://tools.ietf.org/html/rfc6265

- - -

## Frequently Asked Questions (FAQ)

1. Do I need to include **jsonwebtoken** in my project? asked in  [hapi-auth-jwt2/issues/32](https://github.com/dwyl/hapi-auth-jwt2/issues/32)  
**Q**: Must I include the **jsonwebtoken** package in my project
[given that **hapi-auth-jwt2** plugin already includes it] ?  
**A**: Yes, you need to *manually* install the **jsonwebtoken**
node module from NPM with `npm install jsonwebtoken --save` if you want to ***sign*** JWTs in your app.  
Even though **hapi-auth-jwt2** includes it
as a **dependency** your app does not know where to find it in the **node_modules** tree for your project.  
Unless you include it via ***relative path*** e.g:
`var JWT = require('./node_modules/hapi-auth-jwt2/node_modules/jsonwebtoken');`  
we *recommend* including it in your **package.json** ***explicitly*** as a **dependency** for your project.

> *If you have a question*, ***please post an issue/question on GitHub***:
https://github.com/dwyl/hapi-auth-jwt2/issues

<br />
<br />

### Real World Example ?

If you would like to see a "***real world example***" of this plugin in use
in a ***production*** web app (API)
please see: https://github.com/dwyl/time/tree/master/api/lib

+ **app.js** ***registering*** the **hapi-auth-jwt2 plugin**:
[app.js#L13](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js#L13)
+ telling app.js where to find our **validateFunc**tion:
[app.js#L21](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js#L21)
+ **validateFunc**tion (how we check the JWT is still valid):
[api/lib/auth_jwt_validate.js](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_validate.js) looks up the person's session in our ElasticSearch Database
if the [session record is ***found*** (valid) and ***not ended***](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_validate.js#L12) we allow the person to see the restricted content.
+ **Signing your JWTs**: in your app you need a method to *sign* the JWTs (and put them in a database
  if that's how you are *verifying* your sessions) ours is:
  [api/lib/auth_jwt_sign.js](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_sign.js#L18)

If you have ***any questions*** on this please post an issue/question on GitHub:
https://github.com/dwyl/hapi-auth-jwt2/issues  
(*we are here to help get you started on your journey to **hapi**ness!*)

<br />

### Production-ready Example using Redis?

Redis is *perfect* for storing session data that needs to be checked
on every authenticated request.

If you are unfamiliar with Redis or anyone on your team needs a refresher,
please checkout: https://github.com/dwyl/learn-redis

The ***code*** is at: https://github.com/dwyl/hapi-auth-jwt2-example
and with tests. please ask additional questions if unclear!

Having a more real-world example was *seconded* by [@manonthemat](https://github.com/manonthemat) see:
[hapi-auth-jwt2/issues/9](https://github.com/dwyl/hapi-auth-jwt2/issues/9)


- - -

## Contributing [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/hapi-auth-jwt2/issues)

If you spot an area for improvement, please raise an issue: https://github.com/dwyl/hapi-auth-jwt2/issues  
*Someone* in the dwyl team is *always* online so we will usually answer within a few hours.

### Running the tests requires environment variables

The "*real world example*" expects to have two environment variables:
**JWT_SECRET** and **REDISCLOUD_URL**.

> ***Ask*** [@**nelsonic**](https://github.com/nelsonic) for a *valid* **Redis Cloud url** (...*we cannot publish the* ***real*** *one on GitHub...*)

```sh
export JWT_SECRET='ItsNoSecretBecauseYouToldEverybody'
export REDISCLOUD_URL='redis://rediscloud:OhEJjWvSgna@pub-redis-1046.eu-west-1-2.1.ec2.garantiadata.com:10689'
```


# tl;dr

## Motivation

While making [***Time***](https://github.com/dwyl/time) we want to ensure
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

+ For more background on jsonwebtokens (JWTs) see our detailed overview:
https://github.com/dwyl/learn-json-web-tokens
+ Securing Hapi Client Side Sessions:
https://blog.liftsecurity.io/2014/11/26/securing-hapi-client-side-sessions

### Hapi.js Auth

We borrowed code from the following:

+ http://hapijs.com/tutorials/auth
+ https://github.com/hapijs/hapi-auth-basic
+ https://github.com/hapijs/hapi-auth-cookie
+ https://github.com/hapijs/hapi-auth-hawk
+ https://github.com/ryanfitz/hapi-auth-jwt
(Ryan made a good *start* - however, when we tried to submit a [pull request](https://github.com/ryanfitz/hapi-auth-jwt/pull/27)
to improve (_security_) it was *ignored* for _weeks_ ... an *authentication* plugin that [***ignores security updates***](https://github.com/ryanfitz/hapi-auth-jwt/issues/26) in [dependencies](https://david-dm.org/ryanfitz/hapi-auth-jwt)
  is a ***no-go*** for us; **security** ***matters***!) If you spot _any_
  issue in ***hapi-auth-jwt2*** please create an issue: https://github.com/dwyl/hapi-auth-jwt2/issues
  so we can get it _resolved_ ASAP!
