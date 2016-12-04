# Hapi Auth using JSON Web Tokens (JWT)

***The*** authentication scheme/plugin for
[**Hapi.js**](http://hapijs.com/) apps using **JSON Web Tokens**

![hapi-auth-jwt2-diagram-verify](https://cloud.githubusercontent.com/assets/194400/11937081/00f9b4bc-a80a-11e5-9f71-a7e05e92f1ae.png)

[![NSP Status](https://nodesecurity.io/orgs/dwyl/projects/1047e39b-0d4a-45ff-af65-c04afc41fc20/badge)](https://nodesecurity.io/orgs/dwyl/projects/1047e39b-0d4a-45ff-af65-c04afc41fc20)
[![Build Status](https://travis-ci.org/dwyl/hapi-auth-jwt2.svg "Build Status = Tests Passing")](https://travis-ci.org/dwyl/hapi-auth-jwt2)
[![codecov.io Code Coverage](https://img.shields.io/codecov/c/github/dwyl/hapi-auth-jwt2.svg?maxAge=2592000)](https://codecov.io/github/dwyl/hapi-auth-jwt2?branch=master)
[![JavaScript Style Guide: Good Parts](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg?style=flat)](https://github.com/dwyl/goodparts "JavaScript The Good Parts")
[![Inline docs](http://inch-ci.org/github/dwyl/hapi-auth-jwt2.svg?branch=master)](http://inch-ci.org/github/dwyl/hapi-auth-jwt2)
[![Code Climate](https://codeclimate.com/github/dwyl/hapi-auth-jwt2/badges/gpa.svg "No Nasty Code")](https://codeclimate.com/github/dwyl/hapi-auth-jwt2)
[![HAPI 16.0.1](http://img.shields.io/badge/hapi-16.0.1-brightgreen.svg "Latest Hapi.js")](http://hapijs.com)
[![Node.js Version](https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat "Node.js 10 & 12 and io.js latest both supported")](http://nodejs.org/download/)
[![Dependency Status](https://david-dm.org/dwyl/hapi-auth-jwt2.svg "Dependencies Checked & Updated Regularly (Security is Important!)")](https://david-dm.org/dwyl/hapi-auth-jwt2)
[![devDependencies Status](https://david-dm.org/dwyl/hapi-auth-jwt2/dev-status.svg)](https://david-dm.org/dwyl/hapi-auth-jwt2?type=dev)
[![npm package version](https://img.shields.io/npm/v/hapi-auth-jwt2.svg)](https://www.npmjs.com/package/hapi-auth-jwt2)

This node.js module (Hapi plugin) lets you use JSON Web Tokens (JWTs)
for authentication in your [Hapi.js](http://hapijs.com/)
web application.

If you are totally new to JWTs, we wrote an introductory post explaining
the concepts & benefits: https://github.com/dwyl/learn-json-web-tokens

If you (or anyone on your team) are unfamiliar with **Hapi.js** we have a
quick guide for that too: https://github.com/dwyl/learn-hapi

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

    server.auth.strategy('jwt', 'jwt',
    { key: 'NeverShareYourSecret',          // Never Share your secret key
      validateFunc: validate,            // validate function defined above
      verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
    });

    server.auth.default('jwt');

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

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
```

## *Quick Demo*

Open your terminal and clone this repo:

```sh
git clone https://github.com/dwyl/hapi-auth-jwt2.git && cd hapi-auth-jwt2
```

Run the server with:

```sh
npm install && node example/server.js
```

Now (*in a different terminal window*) use `cURL` to access the two routes:

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
or visit: http://localhost:8000/restricted in your web browser.
(*both requests will be blocked and return a `401 Unauthorized` error*)


Now access the url using the following format:
`curl -H "Authorization: <TOKEN>" http://localhost:8000/restricted`

A here's a *valid* token you can use (*copy-paste* this command):
```sh
curl -v -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGhvbnkgVmFsaWQgVXNlciIsImlhdCI6MTQyNTQ3MzUzNX0.KA68l60mjiC8EXaC2odnjFwdIDxE__iDu5RwLdN1F2A" \
http://localhost:8000/restricted
```

or visit this url in your browser (*passing the token in url*):

<small> http://localhost:8000/restricted?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGhvbnkgVmFsaWQgVXNlciIsImlhdCI6MTQyNTQ3MzUzNX0.KA68l60mjiC8EXaC2odnjFwdIDxE__iDu5RwLdN1F2A </small>

That's it.

Now write your own `validateFunc` with what ever checks you want to perform
on the **decoded** token before allowing the visitor to proceed.

## Documentation

- `key` - (***required*** - *unless you have a `customVerify` function*) the secret key (or array of potential keys)
used to check the signature of the token ***or*** a **key lookup function** with
signature `function(decoded, callback)` where:
    - `decoded` - the ***decoded*** but ***unverified*** JWT received from client
    - `callback` - callback function with the signature `function(err, key, extraInfo)` where:
        - `err` - an internal error
        - `key` - the secret key (or array of keys to try)
        - `extraInfo` - (***optional***) any additional information that you would like to use in
        `validateFunc` which can be accessed via `request.plugins['hapi-auth-jwt2'].extraInfo`
- `validateFunc` - (***required***) the function which is run once the Token has been decoded with
 signature `function(decoded, request, callback)` where:
    - `decoded` - (***required***) is the decoded and verified JWT received in the request
    - `request` - (***required***) is the original ***request*** received from the client
    - `callback` - (***required***) a callback function with the signature `function(err, isValid, credentials)` where:
        - `err` - an internal error.
        - `valid` - `true` if the JWT was valid, otherwise `false`.
        - `credentials` - (***optional***) alternative credentials to be set instead of `decoded`.

### *Optional* Parameters

- `verifyOptions` - (***optional*** *defaults to none*) settings to define how tokens are verified by the
[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback) library
    - `ignoreExpiration` - ignore expired tokens
    - `audience` - do not enforce token [*audience*](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#audDef)
    - `issuer` - do not require the issuer to be valid
    - `algorithms` - list of allowed algorithms
- `responseFunc` - (***optional***) function called to decorate the response with authentication headers before the response headers or payload is written where:
    - `request` - the request object.
    - `reply(err, response)`- is called if an error occurred
- `errorFunc` - (***optional*** *defaults to raising the error requested*) function called when an error has been raised. It provides an extension point to allow the host the ability to customise the error messages returned. Passed in object follows the following schema:
    - `errorContext.errorType` - ***required*** the `Boom` method to call (eg. unauthorized)
    - `errorContext.message` - ***required*** the `message` passed into the `Boom` method call
    - `errorContext.schema` - the `schema` passed into the `Boom` method call
    - `errorContext.attributes` - the `attributes` passed into the `Boom` method call
    - The function is expected to return the modified `errorContext` with all above fields defined.
- `urlKey` - (***optional***  *defaults to* `'token'`) - if you prefer to pass your token via url, simply add a `token` url parameter to your request or use a custom parameter by setting `urlKey`. To disable the url parameter set urlKey to `false` or ''.
- `cookieKey` - (***optional*** *defaults to* `'token'`) - if you prefer to set your own cookie key or your project has a cookie called `'token'` for another purpose, you can set a custom key for your cookie by setting `options.cookieKey='yourkeyhere'`. To disable cookies set cookieKey to `false` or ''.
- `headerKey` - (***optional***  *defaults to* `'authorization'`) - The lowercase name of an HTTP header to read the token from. To disable reading the token from a header, set this to `false` or ''.
- `tokenType` - (***optional*** *defaults to none*) - allow custom token type, e.g. `Authorization: <tokenType> 12345678`.
- `complete` - (***optional*** *defaults to* `false`) - set to `true` to receive the complete token (`decoded.header`, `decoded.payload` and `decoded.signature`) as `decoded` argument to key lookup and `verifyFunc` callbacks (*not `validateFunc`*)

### Useful Features

+ The *encoded* JWT (token) is extracted from the request and
made available on the `request` object as `request.auth.token`,
in case you need it later on in the request lifecycle.
This feature was requested by @mcortesi in
[hapi-auth-jwt2/issues/123](https://github.com/dwyl/hapi-auth-jwt2/issues/123)


### Understanding the Request Flow

At the simplest level this is the request flow through a Hapi App
using `hapi-auth-jwt2`:

![hapi auth request flow](https://cloud.githubusercontent.com/assets/443149/11938155/a5fa9554-a7cd-11e5-92b1-01efd6841ded.png)

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

### Using Base64 encoded secret keys

Some authentication services (like Auth0) provide secret keys encoded in base64, To find out if your authentication service is one of these services, please try and experiment with the base64 encoded secret options on the validator at http://jwt.io/

If your key is base64 encoded, then for JWT2 to use it you need to convert it to a buffer.  Following is an example of how to do this.

```js
server.auth.strategy('jwt', 'jwt', true,
{ key: Buffer('<Your Base64 encoded secret key>', 'base64'), // Never Share your secret key
  validateFunc: validate,      // validate function defined above
  verifyOptions: { algorithms: [ 'HS256' ] }  // only allow HS256 algorithm
});
```

### Authentication Modes

This plugin supports [authentication modes](http://hapijs.com/api#route-options) on routes.

- `required` - requires JWT to be sent with every request

- `optional` - if no JWT is provided, request will pass with `request.auth.isAuthenticated` set to `false` and `request.auth.credentials` set to null

- `try` - similar to `optional`, but invalid JWT will pass with `request.auth.isAuthenticated` set to false and failed credentials provided in `request.auth.credentials`

### Additional notes on keys and key lookup functions

- This option to look up a secret key was added to support "multi-tenant" environments. One use case would be companies that white label API services for their customers and cannot use a shared secret key. If the key lookup function needs to use fields from the token header (e.g. [x5t header](http://self-issued.info/docs/draft-jones-json-web-token-01.html#ReservedHeaderParameterName), set option `completeToken` to `true`.

- The reason why you might want to pass back `extraInfo` in the callback is because you likely need to do a database call to get the key which also probably returns useful user data. This could save you another call in `validateFunc`.

- The key or value returned by the key lookup function can also be an array of keys to try.  Keys will be tried until one of them successfully verifies the signature. The request will only be unauthorized if ALL of the keys fail to verify. This is useful if you want to support multiple valid keys (like continuing to accept a deprecated key while a client switches to a new key).

```js
server.auth.strategy('jwt', 'jwt', true,
{ key: [ 'PrimareSecretKey', 'DeprecatedKeyStillAcceptableForNow' ],
  validateFunc: validate,
  verifyOptions: { algorithms: [ 'HS256' ] }
});
```

## URL (URI) Token

Several people requested the ability pass in JSNOWebTokens in the requested URL:
[dwyl/hapi-auth-jwt2/issues/**19**](https://github.com/dwyl/hapi-auth-jwt2/issues/19)

### Usage

Setup your hapi.js server as described above (_no special setup for using JWT tokens in urls_)

```sh
https://yoursite.co/path?token=your.jsonwebtoken.here
```
You will need to generate/supply a valid tokens for this to work.

```js
var JWT   = require('jsonwebtoken');
var obj   = { id:123,"name":"Charlie" }; // object/info you want to sign
var token = JWT.sign(obj, secret);
var url   = "/path?token="+token;
```

> What if I want to *disable* the ability to pass JWTs in via the URL?
> Set your `urlKey` to `false` or ''. (*added by* @bitcloud: [issue #146](https://github.com/dwyl/hapi-auth-jwt2/pull/146))

## Generating Your Secret Key

@skota asked "***How to generate secret key***?" in: [dwyl/hapi-auth-jwt2/issues/**48**](https://github.com/dwyl/hapi-auth-jwt2/issues/48)

There are _several_ options for generating secret keys.
The _easiest_ way is to run node's crypto hash in your terminal:
```js
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```
and copy the resulting base64 key and use it as your JWT secret.
If you are *curious* how strong that key is watch: https://youtu.be/koJQQWHI-ZA


## Want to access the JWT token *after* validation?

[@mcortesi](https://github.com/mcortesi) requested the ability to
access the (*raw*) JWT token used for authentication.
[dwyl/hapi-auth-jwt2/issues/**123**](https://github.com/dwyl/hapi-auth-jwt2/issues/123)

You can access the extracted JWT token in your handler or any other function
within the request lifecycle with the `request.auth.token` property.

*Note* that this is the ***encoded token***,
and it's only useful if you want to use to make
request to other servers using the user's token.

The *decoded* version of the token, accessible via `request.auth.credentials`

## Want to send/store your JWT in a Cookie?

[@benjaminlees](https://github.com/benjaminlees)
requested the ability to send/receive tokens as cookies:
[dwyl/hapi-auth-jwt2/issues/**55**](https://github.com/dwyl/hapi-auth-jwt2/issues/55)
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

For a *detailed* example please see:
https://github.com/nelsonic/hapi-auth-jwt2-cookie-example

#### Background Reading (*Cookies*)

+ Wikipedia has a good intro (general): https://en.wikipedia.org/wiki/HTTP_cookie
+ Cookies Explained (by Nicholas C. Zakas - JavaScript über-master) http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
+ The Unofficial Cookie FAQ: http://www.cookiecentral.com/faq/
+  HTTP State Management Mechanism (long but complete spec):
http://tools.ietf.org/html/rfc6265

- - -

## Frequently Asked Questions (FAQ) [![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


### Do I *need* to include `jsonwebtoken` in my project?

**Q**: Must I include the **jsonwebtoken** package in my project
[given that **hapi-auth-jwt2** plugin already includes it] ? asked in [hapi-auth-jwt2/issues/32](https://github.com/dwyl/hapi-auth-jwt2/issues/32)  
**A**: Yes, you need to *manually* install the **jsonwebtoken**
node module from NPM with `npm install jsonwebtoken --save` if you want to ***sign*** JWTs in your app.
Even though **hapi-auth-jwt2** includes it
as a **dependency** your app does not know where to find it in the **node_modules** tree for your project.
Unless you include it via ***relative path*** e.g:
`var JWT = require('./node_modules/hapi-auth-jwt2/node_modules/jsonwebtoken');`
we *recommend* including it in your **package.json** ***explicitly*** as a **dependency** for your project.

### ***Custom Verification*** ?

Can we supply a ***Custom Verification*** function instead of using the **JWT.verify** method?  
asked by *both* [Marcus Stong](https://github.com/stongo) & [Kevin Stewart](https://github.com/kdstew)
in [issue #120](https://github.com/dwyl/hapi-auth-jwt2/issues/120) and [issue #130](https://github.com/dwyl/hapi-auth-jwt2/issues/130) respectively.
**Q**: Does this module support custom verification function or disabling verification?
**A**: Yes, it *does now*! (*see: "Advanced Usage" below*) the inclusion of a `verifyFunc`
gives you *complete control* over the verification of the incoming JWT.

<br />

### Can I use `hapi-auth-jwt2` with [`glue`](https://github.com/hapijs/glue)

Several people asked us if this plugin is compatible with
Hapi's "Server Composer" [`glue`](https://github.com/hapijs/glue)

The answer is ***Yes***! For an example of how to do this,
see [@avanslaars](https://github.com/avanslaars) code example:
https://github.com/dwyl/hapi-auth-jwt2/issues/151#issuecomment-218321212

<br />

### How do I *invalidate* an *existing token*?

Asked by [@SanderElias](https://github.com/SanderElias) in [hapi-auth-jwt2/issues/126](https://github.com/dwyl/hapi-auth-jwt2/issues/126)

We store our JWT-based sessions in a Redis datastore and lookup the session (`jti`) for the given JWT during the `validateFunc` (*validation function*) see: https://github.com/dwyl/hapi-auth-jwt2-example/blob/791b0d3906d4deb256daf23fcf8f5021905abe9e/index.js#L25
This means we can invalidate the session in Redis and then reject a request that uses an "old" or invalid JWT. see: https://github.com/dwyl/hapi-auth-jwt2-example/blob/791b0d3906d4deb256daf23fcf8f5021905abe9e/index.js#L25


<br />

### How do I set JWT Auth to *All Routes*?

[@abeninskibede](https://github.com/abeninskibede) asked how to set all routes to use JWT Auth in [hapi-auth-jwt2/issues/149](https://github.com/dwyl/hapi-auth-jwt2/issues/149)

We tend to enable `hapi-auth-jwt2` for _all_ routes by setting the `mode` parameter to `true` (so its `required` for all endpoints) because _most_ of the endpoints in our app require the person/user to be authenticated e.g:

```js
// setting the 3rd argument to true means 'mode' is 'required' see: http://hapijs.com/tutorials/auth#mode
server.auth.strategy('jwt', 'jwt', true, { // so JWT auth is required for all routes
  key: process.env.JWT_SECRET,
  validateFunc: require('./jwt2_validate_func'),
  verifyOptions: { ignoreExpiration: true, algorithms: [ 'HS256' ] }
});
```
> _Detailed Practical Example_: https://github.com/dwyl/hapi-login-example-postgres/blob/245a44f0e88226d99a3ad2e3dc38cc0d1750a241/lib/server.js#L33

When you want a particular route to ***not require*** JWT auth you simply set `config: { auth: false }` e.g:
```js
  server.route({
    method: 'GET',
    path: '/login',
    handler: login_handler,  // display login/registration form/page
    config: { auth: false } // don't require people to be logged in to see the login page! (duh!)
  });
```

The best place to _understand_ everything about Hapi Auth is in the docs: http://hapijs.com/tutorials/auth#setting-a-default-strategy
But if you have any questions which are not answered there, feel free to [ask!](https://github.com/dwyl/hapi-auth-jwt2/issues)

<br />

### How to _redirect_ if a token has expired?

@traducer & @goncalvesr2 both requested how to redirect after failed Auth in
[hapi-auth-jwt2/issues/161](https://github.com/dwyl/hapi-auth-jwt2/issues/161)
and [hapi-auth-jwt2/issues/148](https://github.com/dwyl/hapi-auth-jwt2/issues/148) respectively

The [`hapi-error`](https://github.com/dwyl/hapi-error) lets
you _easily_ redirect to any url you define if the Auth check fails
(i.e. `statusCode 401`)
see: https://github.com/dwyl/hapi-error#redirecting-to-another-endpoint
(*code examples there.*)

<br />

### How do I change my token and re-state it without becoming unauthenticated? ###

For example:

If the request.auth.credentials object initially added to your `/` endpoint initial  was:

``` js
{
  userId: 1,
  permission: 'ADMIN'
}
```

And you want to change the user's permission to `SUPER_ADMIN`.

Retrieve the initial session object added as a token to `/`  
```js
var session  = request.auth.credentials;
```
Change the object
```js
session.permission = 'SUPER_ADMIN';
```
Sign as a JWT token again
```js
var token = JWT.sign(session, process.env.JWT_SECRET);
```
Reply as usual whilst re-adding the token to your original endpoint `/`
```js
reply().state('token', token, { path: '/' }).redirect('/wherever');
```

## *Advanced/Alternative* Usage => Bring Your Own `verifyFunc`

While *most* people using `hapi-auth-jwt2` will opt for the *simpler* use case
(*using a* ***Validation Function*** *`validateFunc` - see: Basic Usage example above -
  which validates the JWT payload after it has been verified...*)
others may need more control over the `verify` step.

The [*internals*](https://github.com/dwyl/hapi-auth-jwt2/blob/eb9fff9fc384fde07ec2a1d2f0da520be902da2c/l˜/index.js#L58)
of `hapi-auth-jwt2` use the `jsonwebtoken.verify` method to ***verify*** if the
JTW was signed using the `JWT_SECRET` (*secret key*).

If you prefer specifying your own verification logic instead of having a `validateFunc`, simply define a `verifyFunc` instead when initializing the plugin.

- `verifyFunc` - (***optional***) the function which is run once the Token has been decoded
(*instead of a `validateFunc`*) with signature `function(decoded, request, callback)` where:
    - `decoded` - (***required***) is the decoded but ***unverified*** JWT received in the request.
    - `request` - (***required***) is the original ***request*** received from the client
    - `callback` - (***required***) a callback function with the signature `function(err, isValid, credentials)` where:
        - `err` - an internal error.
        - `valid` - `true` if the JWT was valid, otherwise `false`.
        - `credentials` - (***optional***) alternative credentials to be set instead of `decoded`.

The advantage of this approach is that it allows people to write a
custom verification function or to bypass the `JWT.verify` *completely*.
For more detail, see: use-case discussion in https://github.com/dwyl/hapi-auth-jwt2/issues/120


> ***Note***: *nobody has requested the ability to use* ***both*** *a*
`validateFunc` ***and*** `verifyFunc`.
This should not be *necessary*
because with a `verifyFunc` you can incorporate your own custom-logic.

<br />

### Compatibility

`hapi-auth-jwt2` is compatible with Hapi.js versions `16.x.x`
`15.x.x` `14.x.x` `13.x.x` `12.x.x` `11.x.x` `10.x.x` `9.x.x` and `8.x.x`
as there have been ***no changes*** to how the Hapi plugin system works for a while!

However in the interest of
 security/performance we *recommend* using the [*latest version*](https://github.com/hapijs/hapi/) of Hapi.

> *If you have a question, or need help getting started* ***please post an issue/question on
GitHub***: https://github.com/dwyl/hapi-auth-jwt2/issues *or*
[![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<br />
<br />


### Production-ready Examples?

#### Using PostgreSQL?

See: https://github.com/dwyl/hapi-login-example-postgres

#### Using Redis

Redis is *perfect* for storing session data that needs to be checked
on every authenticated request.

If you are unfamiliar with Redis or anyone on your team needs a refresher,
please checkout: https://github.com/dwyl/learn-redis

The ***code*** is at: https://github.com/dwyl/hapi-auth-jwt2-example
and with tests. please ask additional questions if unclear!

Having a more real-world example was *seconded* by [@manonthemat](https://github.com/manonthemat) see:
[hapi-auth-jwt2/issues/9](https://github.com/dwyl/hapi-auth-jwt2/issues/9)

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

_Aparently, `.some` people like it..._:

[![https://nodei.co/npm/hapi-auth-jwt2.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/hapi-auth-jwt2.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/hapi-auth-jwt2)
