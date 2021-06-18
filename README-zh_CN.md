[![Known Vulnerabilities](https://snyk.io/test/github/dwyl/hapi-auth-jwt2/badge.svg?targetFile=package.json&style=flat-square)](https://snyk.io/test/github/dwyl/hapi-auth-jwt2?targetFile=package.json)
[![Build Status](https://img.shields.io/travis/dwyl/hapi-auth-jwt2/master.svg?style=flat-square)](https://travis-ci.org/dwyl/hapi-auth-jwt2)
[![codecov.io](https://img.shields.io/codecov/c/github/dwyl/hapi-auth-jwt2/master.svg?style=flat-square)](http://codecov.io/github/dwyl/hapi-auth-jwt2?branch=master)
[![Inline docs](http://inch-ci.org/github/dwyl/hapi-auth-jwt2.svg?branch=master&style=flat-square)](http://inch-ci.org/github/dwyl/hapi-auth-jwt2)
[![HAPI 19.1.0](http://img.shields.io/badge/hapi-19.1.0-brightgreen.svg?style=flat-square "Latest Hapi.js")](http://hapijs.com)
[![Node.js Version](https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat-square "Node.js 10 & 12 and io.js latest both supported")](http://nodejs.org/download/)
[![Dependencies Status](https://david-dm.org/dwyl/hapi-auth-jwt2/status.svg?style=flat-square)](https://david-dm.org/dwyl/hapi-auth-jwt2)
[![devDependencies Status](https://david-dm.org/dwyl/hapi-auth-jwt2/dev-status.svg?style=flat-square)](https://david-dm.org/dwyl/hapi-auth-jwt2?type=dev)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](https://github.com/dwyl/hapi-auth-jwt2/issues)
[![HitCount](http://hits.dwyl.io/dwyl/hapi-auth-jwt2.svg)](http://hits.dwyl.io/dwyl/hapi-auth-jwt2)
[![npm package version](https://img.shields.io/npm/v/hapi-auth-jwt2.svg?style=flat-square)](https://www.npmjs.com/package/hapi-auth-jwt2)
# Hapi Auth using JSON Web Tokens (JWT)

使用**JSON Web Tokens**的[**Hapi.js**](http://hapijs.com/)应用程序身份验证方案/插件。

![hapi-auth-jwt2-diagram-verify](https://cloud.githubusercontent.com/assets/194400/11937081/00f9b4bc-a80a-11e5-9f71-a7e05e92f1ae.png)

一个可以让你在你的[Hapi.js](http://hapijs.com/)网站应用中使用`JSON Web Tokens(JWTs)`的Node.js包(Hapi组件)。

如果你对`JWTs`基本不了解，我们编写了一个介绍文章来解释该概念和好处：[https://github.com/dwyl/learn-json-web-tokens](https://github.com/dwyl/learn-json-web-tokens)

如果你(或者你团队中的伙伴)不熟悉**Hapi.js**，我们这里有一个快速指南[https://github.com/dwyl/learn-hapi](https://github.com/dwyl/learn-hapi)

其他语言的文档：

- [English](./README.md)

## 使用(Usage)

我们尽可能使该组件对用户(开发者)友好，但是如果有什么不明白的地方，请在Github上以issue的形式提交问题: [https://github.com/dwyl/hapi-auth-jwt2/issues](https://github.com/dwyl/hapi-auth-jwt2/issues)

### NPM安装

```sh
npm install hapi-auth-jwt2 --save
```

### 示例

基础示例会对你开始使用有所帮助:

```javascript
const Hapi = require('@hapi/hapi');

const people = { // 模拟我们的用户数据库
    1: {
      id: 1,
      name: 'Jen Jones'
    }
};

// 编写你自己的验证函数
const validate = async function (decoded, request, h) {

    // 判断该用户是否正确
    if (!people[decoded.id]) {
      return { isValid: false };
    }
    else {
      return { isValid: true };
    }
};

const init = async () => {
  const server = new Hapi.server({ port: 8000 });
  // 在这里引入我们的包 ↓↓, 例如, require('hapi-auth-jwt2')
  await server.register(require('../lib'));
  server.auth.strategy('jwt', 'jwt',
  { key: 'NeverShareYourSecret', // 不要告诉别人你的secret key
    validate  // 上面定义的验证函数
  });

  server.auth.default('jwt');

  server.route([
    {
      method: "GET", path: "/", config: { auth: false },
      handler: function(request, h) {
        return {text: 'Token not required'};
      }
    },
    {
      method: 'GET', path: '/restricted', config: { auth: 'jwt' },
      handler: function(request, h) {
        const response = h.response({text: 'You used a Token!'});
        response.header("Authorization", request.headers.authorization);
        return response;
      }
    }
  ]);
  await server.start();
  return server;
}
init().then(server => {
  console.log('Server running at:', server.info.uri);
})
.catch(err => {
  console.log(err);
});

```

### *快速示例*

打开你的控制台，克隆以下仓库:

```sh
git clone https://github.com/dwyl/hapi-auth-jwt2.git && cd hapi-auth-jwt2
```

运行服务:

```sh
npm install && node example/server.js
```

现在(*在另一个终端窗口*)使用`cURL`去访问这两个路径:

```sh
curl -v http://localhost:8000/
```

#### 需要令牌(Token Required)

试着*不带Token*去访问`/restricted`内容(会出现**401 error**)

```sh
curl -v http://localhost:8000/restricted
```

或者在你的浏览器中访问: http://localhost:8000/restricted。

(*所有请求都会被禁止并且返回一个`401 Unauthorized`错误*)

现在使用如下格式去访问:
`curl -H "Authorization: <TOKEN>" http://localhost:8000/restricted`

这里有个*有效的*Token你可以使用(*复制-粘贴*该命令):

```sh
curl -v -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGhvbnkgVmFsaWQgVXNlciIsImlhdCI6MTQyNTQ3MzUzNX0.KA68l60mjiC8EXaC2odnjFwdIDxE__iDu5RwLdN1F2A" \
http://localhost:8000/restricted
```

或者在你的浏览器中访问该url(*在url中传入这个token*):

<small> http://localhost:8000/restricted?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6IkFudGhvbnkgVmFsaWQgVXNlciIsImlhdCI6MTQyNTQ3MzUzNX0.KA68l60mjiC8EXaC2odnjFwdIDxE__iDu5RwLdN1F2A </small>

这样就可以了。

现在编写你自己的`验证函数(validate)`在允许访问者继续操作之前执行检查并**解码**Token。

## 文档(Documentation)

- `key` - (***必须*** - *除非你有一个`自定义认证`函数*)这个秘钥(或一系列潜在的秘钥)用于检查token的签名 ***或者*** 一个**秘钥查找函数**和签名`async function(decoded)`例如：
  - `decoded` - 从客户端发来的 ***解码*** 但未 ***验证*** 的JWT。
  - 返回一个对象 `{ key, extraInfo }` 包含:
    - `key` - 秘钥(或者一系列需要尝试的秘钥)
    - `extraInfo` - (***可选***) 任何你想要在`验证函数(validate)`中访问使用的额外信息。
  - 当秘钥查找失败时抛出一个Boom错误。参考[示例](https://github.com/dwyl/hapi-auth-jwt2/blob/master/test/dynamic_key_server.js)和[相关测试](https://github.com/dwyl/hapi-auth-jwt2/blob/master/test/dynamic_key.test.js)。
- `validate` - (***必须***) 该函数`async function(decoded, request, h)`会与签名在Token被解码后运行一次。
  - `decoded` - (***必须***) 是收到请求的JWT解码和验证之后的参数。
  - `request` - (***必须***) 是从客户端收到的原始 ***请求***。
  - `h` - (***必须***) 响应工具集。
  - 返回一个对象 `{ isValid, credentials, response }`
    - `isValid` - 如果JWT验证通过，为`true`，否则就为`false`。
    - `credentials` - (***可选***) 要设置替代凭证，而不是`解码后的数据`。
    - `response` - (***可选***) 如果提供，将立即用作接管响应。
    - `errorMessage` - (***可选*** *默认为* `'Invalid credentials'`) - 如果令牌无效，则会向Boom发出错误消息 (作为`errorContext.message`传递给`errorFunc`)

### *可选* 参数

- `verifyOptions` - (***可选*** *默认为none*) 定义tokens如何被[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)库验证。
  - `ignoreExpiration` - 忽略过期token
  - `audience` - 对[*audience*](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#audDef)不强制执行
  - `issuer` - 不需要发行人(issuer)被验证
  - `algorithms` - 允许的算法列表
- `responseFunc` - (***可选***) 在写入响应头或payload中之前调用的函数，使用身份验证头装饰响应:
  - `request` - 请求对象。
  - `h` - 响应工具集。
- `errorFunc` - (***可选*** *默认情况下抛出请求错误*)当错误被抛出时，调用该函数。它提供了一个允许主机可以自定义错误信息的扩展点。传入的对象遵循以下范式:
  - `errorContext` - 请求对象。
    - `errorContext.errorType` - ***必须*** 调用`Boom`方法。（例如，未认证）
    - `errorContext.message` - ***必须*** 调用`Boom`方法时传入的`message`
    - `errorContext.schema` - 调用`Boom`方法时传入的`schema`
    - `errorContext.attributes` - 调用`Boom`方法时传入的`attributes`
    - 该函数返回了上述所有字段修改后的`errorContext`
  - `request` - 请求对象。
  - `h` - 响应工具集。
- `urlKey` - (***可选*** *默认 `'token'`*) - 如果你更愿意通过url来传递你得token，直接添加一个url参数`token`到你的请求中或者用一个`urlKey`设置的自定义参数。设置`urlKey`为`false`或`''`禁用该url参数。
- `cookieKey` - (***可选*** *默认 `'token'`*) - 如果你更愿意设置你自己的cookie键名或者你得项目已经有一个键名为`token`的cookie了，你可以通过`options.cookieKey='yourkeyhere'`设置为你的cookie设置一个自定义的键名。
- `headerKey` - (***可选*** *默认 `'authorization'`*) - 从http头读取token的键名小写形式。如果想要禁止从(请求)头读取token，设置该值为`false`或`''`。
- `payloadKey` - (***可选*** *默认 `'token'`*) - 从http的POST请求体中读取token的键名小写形式。如果想要禁止从http的POST请求体中读取token，设置该值为`false`或`''`。请注意，除非`attemptToExtractTokenInPayload`为`false`，否则这不能防止认证失败。
- `tokenType` - (***可选*** *默认为空*) - 允许自定义token类型。例如：`Authorization: <tokenType> 12345678`。
- `complete` - (***可选*** *默认为`false`*) - 设为`true`获取完整的token(`decoded.header`, `decoded.payload` 和 `decoded.signature`)作为`verify`回调函数的`decoded`的参数。
- `headless` - (***可选*** *默认为空*) - 设置为一个`对象`，其中包含JWT令牌头部内容，应将其添加到收到的无头的JWT令牌中。带有头部的令牌仍可在激活此选项的情况下使用。例如：`{ alg: 'HS256', typ: 'JWT' }`
- `attemptToExtractTokenInPayload` - (***可选*** *默认为`false`*) - 设为`true`让`authenticate`方法遇到含有`payload`（POST请求体）,从`payload`中提取令牌
- `customExtractionFunc` - (***可选***) 调用该函数以执行JWT的自定义提取，其中：
  - `request` - 请求对象。

### 有用的特性

+ 从请求中提取的*解码的*JWT（token）会在`request`对象以`request.auth.token`提供，以供之后你在请求的生命周期中使用。该特性被@mcortesi在[hapi-auth-jwt2/issues/123](https://github.com/dwyl/hapi-auth-jwt2/issues/123)提及

### 理解请求流

最简单的，这是使用`hapi-auth-jwt2`通过Hapi应用的请求流：

![hapi auth request flow](https://cloud.githubusercontent.com/assets/443149/11938155/a5fa9554-a7cd-11e5-92b1-01efd6841ded.png)

### verifyOptions让您定义如何验证令牌（*可选*）

示例：

```js
server.auth.strategy('jwt', 'jwt', true,
{ key: 'NeverShareYourSecret', // 不要告诉别人你的secret key
  validate: validate,      // 上面定义的验证函数
  verifyOptions: {
    ignoreExpiration: true,    // 过期token不会抛出错误
    algorithms: [ 'HS256' ]    // 指定你的安全算法
  }
});
```

更多请阅读：[jsonwebtoken verify options]( https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

### 指定签名算法（*可选，但是强烈建议使用*）

阅读[security reasons](https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/)，它建议您指定在对令牌进行签名时使用的允许算法。

```js
server.auth.strategy('jwt', 'jwt', true,
{ key: 'YourSuperLongKeyHere', // 不要告诉别人你的secret key
  validate: validate,      // 上面定义的验证函数
  verifyOptions: { algorithms: [ 'HS256' ] }  // 只允许HS256算法
});
```

如果你更愿意*不*简单地使用这些verifyOptions中的任何一个，那么在您的应用中注册插件时，请勿进行设置；它们都是可选的。

该特性在[issues/29](https://github.com/dwyl/hapi-auth-jwt2/issues/29)中被要求到。

### 使用base64编码秘钥

某些认证服务（例如Auth0）提供base64加密的秘钥。若要判断你的认证服务是否是这些服务之一，请尝试在[http://jwt.io/](http://jwt.io/)上的验证器上尝试使用base64编码秘钥选项。

如果你的秘钥是base64编码的，为了让`JWT2`使用它，您需要将其转换为`Buffer`。以下是一个使用示例：

```js
server.auth.strategy('jwt', 'jwt', true,
{ key: Buffer.from('<Your Base64 encoded secret key>', 'base64'), // 不要告诉别人你的secret key
  validate: validate,      // 上面定义的验证函数
  verifyOptions: { algorithms: [ 'HS256' ] }  // 只允许HS256算法
});
```

### 认证模式

该插件在路由上支持[认证模式](http://hapijs.com/api#route-options)。

- `required` - 每个请求都需要带上JWT
- `optional` - 如果没有提供JWT，请求将会将`request.auth.isAuthenticated`设为`false`并且`request.auth.credentials`会设置为空
- `try` - 与`optional`相似，但是无效的JWT可以将`request.auth.isAuthenticated`设置为`false`并且`request.auth.credentials`提供错误的认证。

### 有关键和键查找功能的其他说明

- 查找秘钥的选项已添加，以支持"multi-tenant（多用户）"环境。一个使用场景是那些为其客户贴上API服务标签且无法使用共享密钥的公司。如果键查找功能需要使用令牌头中的字段（例如[x5t header](http://self-issued.info/docs/draft-jones-json-web-token-01.html#ReservedHeaderParameterName)），设置选项`completeToken`为`true`。

- 你可能想在回调中传递回`extraInfo`的原因是，你可能需要执行数据库调用来获取密钥，该密钥也可能返回有用的用户数据。这可以节省你再次调用`validate`。

- 键查找功能返回的键或值也可以是要尝试的键数组。将会依次尝试秘钥，直到其中一个密钥成功验证签名为止。仅当所有密钥均无法验证时，请求才会被认定为未经授权。如果你要支持多个有效密钥（例如，当客户端切换到新密钥时继续接受已弃用的密钥），这将非常有用。

```js
server.auth.strategy('jwt', 'jwt', true,
{ key: [ 'PrimareSecretKey', 'DeprecatedKeyStillAcceptableForNow' ],
  validate: validate,
  verifyOptions: { algorithms: [ 'HS256' ] }
});
```

## URL（URI） Token

好些个用户请求在请求的URL中传入JSNOWebTokens的能力：

[dwyl/hapi-auth-jwt2/issues/**19**](https://github.com/dwyl/hapi-auth-jwt2/issues/19)

### 使用

按照上面的描述安装你的hapi.js服务端（*在urls中使用JWT令牌无需特殊的安装*）

```sh
https://yoursite.co/path?token=your.jsonwebtoken.here
```

你将需要生成/提供一个有效的令牌以供这个正常使用。

```js
const JWT   = require('jsonwebtoken');
const obj   = { id:123,"name":"Charlie" }; // 你想要加密的object或者信息
const token = JWT.sign(obj, secret);
const url   = "/path?token="+token;
```

> 如果我想要*禁用*这个在URL中传递JWT的功能呢？
> 设置`urlKey`为`false`或者`''`。（由@bitcloud: [issue #146](https://github.com/dwyl/hapi-auth-jwt2/pull/146)添加）

## 生成你的秘钥

@skota在[dwyl/hapi-auth-jwt2/issues/**48**](https://github.com/dwyl/hapi-auth-jwt2/issues/48)中提出"***怎样生成秘钥***"的疑问。

这里有*一些*选项去生成秘钥。

最*简单*的方法就是在你的终端运行Node的`crypto`哈希算法：

```js
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

然后拷贝该base64格式的结果作为你的JWT秘钥。

## 想要在验证*之后*访问JWT令牌？

[@mcortesi](https://github.com/mcortesi)在[dwyl/hapi-auth-jwt2/issues/**123**](https://github.com/dwyl/hapi-auth-jwt2/issues/123)中提出想要访问用于身份认证的*原始*JWT令牌。

你可以使用`request.auth.token`属性在处理程序中或请求生命周期内的任何其他函数中访问提取的JWT令牌。

*注意*这个是 ***加密的令牌***，它仅仅在你想要用该用户的令牌请求别的服务器时比较有用。

*解密*的token，可以通过`request.auth.credentials`访问

## 想要发送你的JWT/在Cookie中存储你的JWT？

[@benjaminlees](https://github.com/benjaminlees)在[dwyl/hapi-auth-jwt2/issues/**55**](https://github.com/dwyl/hapi-auth-jwt2/issues/55)中要求以cookies的形式发送/接口令牌

因此，我们添加了*可选地*将令牌发送/存储在Cookie中的功能以此来简化构建您的*网络应用程序*。

要在你的应用程序中启用cookie支持，你需要做的就是添加几行代码：

### Cookie选项

首先设置选项你想要应用到cookie：

```js
const cookie_options = {
  ttl: 365 * 24 * 60 * 60 * 1000, // 从今天开始一年后过期
  encoding: 'none',    // 我们已经使用JWT进行编码
  isSecure: true,      // 温暖且模糊的感觉
  isHttpOnly: true,    // 防止客户变更
  clearInvalid: false, // 移除无效cookies
  strictHeader: true   // 不允许违反RFC-6265
}
```

### 在你的`reply`中设置cookie

然后，在你的认证控制器中：

```js
reply({text: 'You have been authenticated!'})
.header("Authorization", token)        // JWT的令牌在哪
.state("token", token, cookie_options) // 通过选项设置cookie
```

*详细的*示例请看：[https://github.com/nelsonic/hapi-auth-jwt2-cookie-example](https://github.com/nelsonic/hapi-auth-jwt2-cookie-example)

#### 背景阅读（*Cookie*）

+ 维基百科有个很好的介绍：[https://en.wikipedia.org/wiki/HTTP_cookie](https://en.wikipedia.org/wiki/HTTP_cookie)
+ Cookie的解释（由Nicholas C. Zakas - JavaScript über-master）[http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/](http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/)
+ 非官方的cookie FAQ：[http://www.cookiecentral.com/faq/](http://www.cookiecentral.com/faq/)
+ HTTP状态管理机制（很长但是完整）：[http://tools.ietf.org/html/rfc6265](http://tools.ietf.org/html/rfc6265)

- - -

## FAQ

### 我是否*需要*在我的项目中包含`jsonwebtoken`？

**Q**：我是否必须将**jsonwebtoken**引入我的项目中（鉴于**hapi-auth-jwt2**已经包含了它）？在[hapi-auth-jwt2/issues/32](https://github.com/dwyl/hapi-auth-jwt2/issues/32)有问到。

**A**：是的，如果你想要在你的应用中 ***加密(sign)*** JWT 你需要*手动地*使用NPM命令`npm install jsonwebtoken --save`安装**jsonwebtoken** Node模块。

即便**hapi-auth-jwt2**已经在**依赖**中包含了它，但是你的应用无法知道在**node_modules**依赖树中的哪里可以找到它。

除非你在引入它的时候使用**相对定位**，例如：

```js
const JWT = require('./node_modules/hapi-auth-jwt2/node_modules/jsonwebtoken');
```

我们*建议*在你的**package.json**文件中 ***明确的*** 将其作为你项目的一个**依赖项**。

### ***自定义验证***？

我们能否提供一个 ***自定义验证*** 函数来替代使用**JWT.verify**方法？该问题由[Marcus Stong](https://github.com/stongo)和[Kevin Stewart](https://github.com/kdstew)分别在[issue #120](https://github.com/dwyl/hapi-auth-jwt2/issues/120)和[issue #130](https://github.com/dwyl/hapi-auth-jwt2/issues/130)中提出。

**Q**：该模块是否支持自定义验证函数或者禁用验证？

**A**：是的，它*现在支持了*！（*请看下面的“高级用法”*）包含`verify`可以使你对传入JWT的验证的*完全控制*。

### 我能将`hapi-auth-jwt2`与[`glue`](https://github.com/hapijs/glue)一起使用么？

一些用户询问我们该组件是否与Hapi的“Server Composer”[`glue`](https://github.com/hapijs/glue)兼容

答案是 ***当然***！这里有一个示例如何去做，请看[@avanslaars](https://github.com/avanslaars)的代码示例：[https://github.com/dwyl/hapi-auth-jwt2/issues/151#issuecomment-218321212](https://github.com/dwyl/hapi-auth-jwt2/issues/151#issuecomment-218321212)

### 我怎样*废除*一个*存续的令牌*？

由[@SanderElias](https://github.com/SanderElias)在[hapi-auth-jwt2/issues/126](https://github.com/dwyl/hapi-auth-jwt2/issues/126)问及

我们将基于JWT的回话存储在Redis数据存储区中，并在`验证(validate)`（*验证函数*）期间查找给定JWT的会话（`jti`），请看：[https://github.com/dwyl/hapi-auth-jwt2-example/blob/791b0d3906d4deb256daf23fcf8f5021905abe9e/index.js#L25](https://github.com/dwyl/hapi-auth-jwt2-example/blob/791b0d3906d4deb256daf23fcf8f5021905abe9e/index.js#L25)

这意味着我们可以在Redis中使会话无效，然后拒绝使用“旧的”或无效JWT的请求。请看：[https://github.com/dwyl/hapi-auth-jwt2-example/blob/791b0d3906d4deb256daf23fcf8f5021905abe9e/index.js#L25](https://github.com/dwyl/hapi-auth-jwt2-example/blob/791b0d3906d4deb256daf23fcf8f5021905abe9e/index.js#L25)

### 我怎样才能使*所有路由*都用上JWT验证？

[@abeninskibede](https://github.com/abeninskibede)在[hapi-auth-jwt2/issues/149](https://github.com/dwyl/hapi-auth-jwt2/issues/149)中问到怎样使所有路由都用上JWT验证

我们倾向于设置'jwt'默认策略为*所有*路由都开启`hapi-auth-jwt2`（故所有接口都会是`required`）因为在我们的应用中*大部分*接口都要求人/用户是被认证的。例如：

```js
server.auth.strategy('jwt', 'jwt', {
  ...
});
server.auth.default('jwt'); // 所有路由都会要求JWT认证
```

当你想要一个特殊的路由的JWT认证为 ***不必须*** 时，你只需要简单的设置`config: { auth: false }`。例如：

```js
server.route({
  method: 'GET',
  path: '/login',
  handler: login_handler,  // 显示登录/注册表单/页面
  options: { auth: false } // 不需要人们登录才能看到登录页面！
});
```

*理解*所有关于Hapi认证最好的地方就是文档：[http://hapijs.com/tutorials/auth#setting-a-default-strategy](http://hapijs.com/tutorials/auth#setting-a-default-strategy)

但是如果你有什么文档解答不了的问题，请随意提[issue](https://github.com/dwyl/hapi-auth-jwt2/issues)

### 当一个令牌已经过期时如何*重定向*？

@traducer 和 @goncalvesr2 在[hapi-auth-jwt2/issues/161](https://github.com/dwyl/hapi-auth-jwt2/issues/161)和[hapi-auth-jwt2/issues/148](https://github.com/dwyl/hapi-auth-jwt2/issues/148)中分别有问到当认证失败后如何重定向的问题。

如果认证失败了，`hapi-error`(https://github.com/dwyl/hapi-error)可以让你*轻松地*重定向到任何你定义的url上（换句话说：`statusCode 401`）

请看[https://github.com/dwyl/hapi-error#redirectredirecting-to-another-endpoint](https://github.com/dwyl/hapi-error#redirectredirecting-to-another-endpoint)（*代码示例*）

### 如何更改我的令牌并重新存储它而不会变得未经身份验证？

举个例子：

如果最初添加到你的`/`接口初始化的`request.auth.credentials`对象为：

```js
{
  userId: 1,
  permission: 'ADMIN'
}
```

然后你想要修改用户的权限为`SUPER_ADMIN`。

检索作为标记添加到`/`的初始会话对象

```js
const session  = request.auth.credentials;
```

修改该对象

```js
session.permission = 'SUPER_ADMIN';
```

再次加密一个JWT令牌

```js
const token = JWT.sign(session, process.env.JWT_SECRET);
```

像往常一样回复，同时将令牌重新添加到原始接口`/`中。

```js
reply().state('token', token, { path: '/' }).redirect('/wherever');
```

## *我如何在禁用JS的情况下支持用户*

当JWT太大而无法传递查询字符串时，如果支持禁用JavaScript的用户，就会出现问题。

在禁用JS的情况下，无法使用从OAuth提供程序到消费服务的重定向将令牌添加到标头中。

云提供商将对URI长度施加限制

OAuth服务可能并不总是位于受保护服务的同级子域上，从而无法使用安全Cookie

在这种情况下，如果用户禁用了JS，传递令牌的唯一方法是使用HTML表单（该令牌在隐藏的字段中）和带有说明的按钮，则提示用户按此按钮；如果JS被启用了，某些JS则将自动提交表单

为了配置`hapi-auth-jwt`以支持这种情况，你需要调整以下样本配置

```js
server.auth.strategy('jwt', 'jwt', {
  key: 'NeverShareYourSecret',
  // 定义你自己的验证函数
  // useful/custom with the decodedToken before reply(ing)
  validate: (decoded, request) => true,
  verifyOptions: { algorithms: [ 'HS256' ] }, // 只允许HS256加密算法
  attemptToExtractTokenInPayload: true,
  // 使用yar作为session缓存存储tokens, 详见: https://github.com/hapijs/yar
  customExtractionFunc: request => {
    if (request.auth && request.auth.token) {
      request.yar.set('token', request.auth.token)
      return request.auth.token;
    }
    const token = request.yar.get('token');
    if (token) {
      return token;
    }
  }
});
```

上面的配置仍将运行请求头，Cookie，查询字符串参数和自定义提取的常规令牌提取尝试。但是，如果没有成功提取的令牌，它将尝试从POST请求正文中提取一个令牌

由于HAPI请求的身份验证阶段将在分析POST主体之前应用范围保护，你还需要定义在没有应用范围的情况下处理JWT的路由，否则当您将范围全局应用为您的一部分时，带有JWT有效负载的POST请求将失败应用

```js
server.route([
  {
    method: 'POST',
    path: '/',
    handler: (request, response) => response.redirect('/home'),
    config: {
      auth: {
        strategies: ['jwt'],
        payload: 'required'
      }
    }
  }
]);
```

当将JWT发布到从验证阶段到有效负载验证阶段的故障转移时，此路由将提取JWT，将其存储在YAR会话缓存中，并使用标准302响应将用户重定向到`/home`路径。 当`/home`的处理程序受JWT保护时，在认证策略中定义的`customExtractionFunc`将从用户会话缓存中读取JWT并将其用于身份验证

## *高级/替代*使用 => 使用你自己的`验证(verify)`

虽然*多数*使用`hapi-auth-jwt2`的人会选择*更简单的*用例（*使用一个* ***验证函数*** *参见上面的用法——在验证JWT有效负载后对其进行验证*）。但是其他人可能需要对`验证(verify)`步骤进行更多控制。

`hapi-auth-jwt2`的[*internals*](https://github.com/dwyl/hapi-auth-jwt2/blob/eb9fff9fc384fde07ec2a1d2f0da520be902da2c/l˜/index.js#L58)使用`jsonwebtoken.verify`方法去 ***验证*** JWT是否使用 `JWT_SECRET`（*秘钥*）加密。

如果您更愿意指定自己的验证逻辑，而不要使用`验证（verify）`方法，最简单的方法就是在初始化该插件时定义一个`verify`方法进行代替。

- `verify` - (***可选***) 在令牌被解码时将会执行一次验证的函数（*而不是`validate`*）`async function(decoded, request)`：
  - `decoded` - (***必须***) 从请求中获取的解码的但是 ***未验证***的数据
  - `request` - (***必须***) 从客户端接收到的原始的 ***请求***
  - 返回一个对象 `{ isValid, credentials }`:
    - `isValid` - 如果JWT验证通过为`true`，否则为`false`
    - `credentials` - (***可选***) 用来替代`decoded`的凭证

这种方法的优点是它使人们可以编写一个自定义验证功能或*完全*绕过`JWT.verify`。

获取更多详情，请看：[https://github.com/dwyl/hapi-auth-jwt2/issues/120](https://github.com/dwyl/hapi-auth-jwt2/issues/120)中关于使用场景的讨论

> ***Note***：*没人会要求 ***同时*** 使用`validate` 和 `verify`*.

这不应该是*必须的*，因为使用`verify`你可以合并你自己的逻辑。

### 兼容性

**`10.x.x`** 版本的 **`hapi-auth-jwt2`** 是一个 ***可选的升级***，因为它包含了突破性的（破坏性的）修改。

一些该插件的用户要求提供`artifacts`，以使身份验证成功后返回的是`Object`而不是`String`。

遗憾的是，这是一个具有破坏性的修改，因此只能放在新的主要版本中。

仅支持 **Node.js 12+** 的 **`9.x.x`** 版本的 **`hapi-auth-jwt2`** 与 **`19.x.x`版本的Hapi.js** 兼容。

`9.0.0`的 **`hapi-auth-jwt2`** 较之 `v8.8.1`版本没有*任何*代码改动（*故不需要更新使用此插件的代码*）。

我们认为应该谨慎地向人们表明[Hapi.js（*核心框架*）放弃了对Node.js 10的支持](https://github.com/dwyl/hapi-auth-jwt2/issues/338#issuecomment-583716612)，同时人们也应该将该插件视为不再支持旧版本的Node。

`8.x.x`版本的`hapi-auth-jwt2`与`17.x.x` - `19.x.x`版本的Hapi.js兼容

`7.x.x`版本的`hapi-auth-jwt2`与`16.x.x` `15.x.x` `14.x.x` `13.x.x` `12.x.x` `11.x.x` `10.x.x` `9.x.x` `8.x.x` 版本的Hapi.js兼容，`17.x.x`版本的Hapi.js是一次重大的重写，这就是为什么`8.x.x`版本的`hapi-auth-jwt2`插件不向后兼容的原因！

但是为了安全和性能，我们*建议*使用[*最新版本*](https://github.com/hapijs/hapi/)的Hapi。

> *如果你有问题，或者需要帮助的地方* ***请提交一个issue/问题到Github***：[https://github.com/dwyl/hapi-auth-jwt2/issues](https://github.com/dwyl/hapi-auth-jwt2/issues)

### 生产环境的实例？

#### 使用PostgreSQL？

请看：[https://github.com/dwyl/hapi-login-example-postgres](https://github.com/dwyl/hapi-login-example-postgres)

#### 使用Redis

使用Redis在每个经过身份验证的请求上存储会话数据是*完美的选择*。

如果你不熟悉Redis或团队中的某人需要复习，请看[https://github.com/dwyl/learn-redis](https://github.com/dwyl/learn-redis)

***代码*** 和测试在[https://github.com/dwyl/hapi-auth-jwt2-example](https://github.com/dwyl/hapi-auth-jwt2-example)。如果有不清楚的地方欢迎随时提问！

一个更真实的例子是由[@manonthemat](https://github.com/manonthemat)维护的，请看[hapi-auth-jwt2/issues/9](https://github.com/dwyl/hapi-auth-jwt2/issues/9)

### 真实案例？

如果你想要看一下关于该插件在一个 ***生产环境***中的网页应用（API）的 ***真实案例***，请看[https://github.com/dwyl/time/tree/master/api/lib](https://github.com/dwyl/time/tree/master/api/lib)

+ **app.js** ***注册*** 了该 **hapi-auth-jwt2插件**：
[app.js#L13](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js#L13)

+ 告诉app.js在哪找到我们的**验证**函数：
[app.js#L21](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/app.js#L21)

+ **验证**函数（我们怎样查验JWT是否有效）:
[api/lib/auth_jwt_validate.js](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_validate.js)
在我们的ElasticSearch数据库中查找该人的会话，如果[***找到*** （有效）会话记录并且未结束](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_validate.js#L12)我们就允许该用户浏览限制的内容。

+ **加密你的JWT**：在你的应用中，你需要一个方法去 *加密* JWT（并且将其存入数据库中，如果那是您*验证*会话的方式的话），我们的是：[api/lib/auth_jwt_sign.js](https://github.com/dwyl/time/blob/0a5ec8711840528a4960c388825fb883fabddd76/api/lib/auth_jwt_sign.js#L18)

如果你有 ***任何问题*** 关于这个，请提交issue/提问到Github:
[https://github.com/dwyl/hapi-auth-jwt2/issues](https://github.com/dwyl/hapi-auth-jwt2/issues)
（*我们将在这里帮助你开始你的 **Hapi**（Happy）之旅！ *）

## 贡献[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/hapi-auth-jwt2/issues)

如果你发现有待改进的地方，请提交一个issue到：[https://github.com/dwyl/hapi-auth-jwt2/issues](https://github.com/dwyl/hapi-auth-jwt2/issues)总有dwyl团队的一员会*一直*在线，所以我们会在几小时内给你答复。

## 动机

当开发[***Time***](https://github.com/dwyl/time)时，我们想确保我们的应用（和API）能够*尽可能的* ***易用***。
这导致我们使用JSON Web Token进行无状态身份验证。

我们针对那些*可能*解决我们问题的*现存的*模块做了一个*广泛的*[调查](https://www.npmjs.com/search?q=hapi+auth+jwt)；他们大多在NPM上：![NPM搜索hapi+jwt关键字](http://i.imgur.com/xIj3Xpa.png)

但是它们总是 ***太复杂了***，只有匮乏的文档和*用处不大*（没有真实案例）的“例子”。

并且，没有一个*现存的*模块对**验证方法（validate）**暴露了**request**对象，我们认为这样会更方便一些。

所以我们决定根据这些issue写一个我们自己的模块。

*不要相信我们，做自己的功课，然后决定自己喜欢哪个模块。*

## 为什么选择hapi-auth-jwt2？

我们想选的名字被选了。
我们认为我们的模块是“***新的，简化且积极维护的版本***”

## 有用的链接

+ 更多有关于jsonwebtokens（JWTs）请看我们的详细概述：
[https://github.com/dwyl/learn-json-web-tokens](https://github.com/dwyl/learn-json-web-tokens)

+ 保护Hapi客户端会话：
[https://blog.liftsecurity.io/2014/11/26/securing-hapi-client-side-sessions](https://blog.liftsecurity.io/2014/11/26/securing-hapi-client-side-sessions)

### Hapi.js认证

我从以下项目中借鉴了代码：

+ [http://hapijs.com/tutorials/auth](http://hapijs.com/tutorials/auth)
+ [https://github.com/hapijs/hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic)
+ [https://github.com/hapijs/hapi-auth-cookie](https://github.com/hapijs/hapi-auth-cookie)
+ [https://github.com/hapijs/hapi-auth-hawk](https://github.com/hapijs/hapi-auth-hawk)
+ [https://github.com/ryanfitz/hapi-auth-jwt](https://github.com/ryanfitz/hapi-auth-jwt)
（Ryan起了个好头——然而，当我们准备提交一个[pull request](https://github.com/ryanfitz/hapi-auth-jwt/pull/27)去增加它的（*安全*），却被*忽略*了*好几周*……一个[依赖](https://david-dm.org/ryanfitz/hapi-auth-jwt)中的*认证*组件[***忽略安全更新***](https://github.com/ryanfitz/hapi-auth-jwt/issues/26)）

这对我们来说是 ***不行的***，***安全很重要！***如果你在 ***hapi-auth-jwt2*** 中发现任何问题，请创建一个issue
[https://github.com/dwyl/hapi-auth-jwt2/issues](https://github.com/dwyl/hapi-auth-jwt2/issues)
以便我们可以尽我们可能快地*处理*它！

*显然*，`某些`用户喜欢它……：

[![https://nodei.co/npm/hapi-auth-jwt2.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/hapi-auth-jwt2.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/hapi-auth-jwt2)
