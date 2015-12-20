
2. Can we supply a ***Custom Verification*** function instead of using the **JWT.verify** method?  
asked by *both* [Marcus Stong](https://github.com/stongo) & [Kevin Stewart](https://github.com/kdstew)
in [issue #120](https://github.com/dwyl/hapi-auth-jwt2/issues/120) and [issue #130](https://github.com/dwyl/hapi-auth-jwt2/issues/130) respectively.  
**Q**: Does this module support custom verification function or disabling verification?  
**A**: Yes, it *does now*! (*see: "Advanced Usage" below*) the inclusion of a `verifyFunc`  
gives you *complete control* over the verification of the incoming JWT.


## *Advanced/Alternative* Usage => Bring Your Own `verifyFunc`

While *most* people using `hapi-auth-jwt2` will opt for the *simpler* use case
(*using a* ***Validation Function*** *`validateFunc` - see: Basic Usage example above -  
  which validates the JWT payload after it has been verified...*)
others may need more control over the `verify` step.

The [*internals*](https://github.com/dwyl/hapi-auth-jwt2/blob/eb9fff9fc384fde07ec2a1d2f0da520be902da2c/lib/index.js#L58)
of `hapi-auth-jwt2` use the `jsonwebtoken.verify` method to ***verify*** if the
JTW was signed using the `JWT_SECRET` (*secret key*).

If you prefer specify your own verification steps instead of having a `validateFunc` simply define a `verifyFunc` ***instead***
while you are initializing the plugin.

- `verifyFunc` - (***optional***) the function which is run once the Token has been decoded
(*instead of a `validateFunc`*) with signature `function(decoded, request, callback)` where:
    - `decoded` - (***required***) is the ***decoded*** and ***verified*** JWT received from the client in **request.headers.authorization**
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
