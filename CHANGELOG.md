# Change Log

This project adheres to [Semantic Versioning](https://semver.org/).  
Every release, along with the migration instructions (where necessary),
is documented on the Github [Releases](https://github.com/dwyl/hapi-auth-jwt2/releases) page.

If anything is unclear in the project documentation, please
raise an issue: https://github.com/dwyl/hapi-auth-jwt2/issues (_we are here to help!_)

# Version 10.3.0 - Security Update to `jsonwebtoken` Dependency

Update version of `jsonwebtoken` dependency to latest
to avoid security issues. 
See: https://github.com/dwyl/hapi-auth-jwt2/pull/374 thanks @AntoineAA 
More detail in: https://github.com/dwyl/hapi-auth-jwt2/pull/373 thanks Snyk. 

# Version 10.0.0

Version 10.0.0 introduces a ***breaking change***
where the returned `payload` `Object`
now contains an `artifacts` `Object` of the form:

```js
return {
  payload: {
    credentials: credentials
    artifacts: {
      token,
      decoded,
    },
  },
};
```

Previously the value of `artifacts` was just the `token`.
Anyone using version `9.0.0` will need to make the minor update
to use `payload.artifacts.token` as opposed to `payload.artifacts`.

# Version 9.0.0

Version 9.0.0 is compatible with Hapi 19.x.x
