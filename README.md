# Hapi Auth with JSON Web Tokens (JWT)

The ***simplest*** authentication scheme/plugin for
[Hapi.js](http://hapijs.com/) apps using JSON Web Tokens.
[![contributions welcome](https://img.shields.io/badge/Authorization-JWT-brightgreen.svg?style=flat)](https://github.com/ideaq/hapi-auth-jwt)

[![Node.js Version][node-version-image]][node-version-url]
[![NPM Version][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/ideaq/hapi-auth-jwt2.svg)](https://travis-ci.org/ideaq/hapi-auth-jwt2)
[![Test Coverage](https://codeclimate.com/github/ideaq/hapi-auth-jwt2/badges/coverage.svg)](https://codeclimate.com/github/ideaq/hapi-auth-jwt2)
[![Code Climate](https://codeclimate.com/github/ideaq/hapi-auth-jwt2/badges/gpa.svg)](https://codeclimate.com/github/ideaq/hapi-auth-jwt2)
[![Dependency Status](https://david-dm.org/ideaq/hapi-auth-jwt2.svg)](https://david-dm.org/ideaq/hapi-auth-jwt2)



## Motivation

While making [***Time***](https://github.com/ideaq/time) we want to ensure
our app (and API) is as ***simple*** as *possible* to use.  
This lead us to using JSON Web Tokens for ***Stateless*** Authentication.

We did a *extensive* [research](https://www.npmjs.com/search?q=hapi+auth+jwt)
into *existing* modules that *might* solve our problem; there are *many* on NPM:
![npm search for hapi+jwt](http://i.imgur.com/xIj3Xpa.png)

but they invariably were ***way too complicated***, poorly documented and
had *useless* (non-real-world) "examples"!  
So we decided to write our own.

*Don't take our word for it, do your own homework and decide which module you prefer.*

### *Guiding Principal*

> "* **perfection** is **attained** not when there is nothing more to add,  
> but when there is **nothing more to remove*** " ~
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
