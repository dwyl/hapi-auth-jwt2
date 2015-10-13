{
  "name": "hapi-auth-jwt2",
  "version": "5.1.1",
  "description": "Hapi.js Authentication Plugin/Scheme using JSON Web Tokens (JWT)",
  "main": "lib/index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/dwyl/hapi-auth-jwt2.git"
  },
  "keywords": [
    "Hapi.js",
    "Authentication",
    "Auth",
    "JSON Web Tokens",
    "JWT"
  ],
  "author": "@nelsonic <contact.nelsonic@gmail.com> (https://github.com/nelsonic)",
  "contributors": [
    {
      "name": "Kevin Wu",
      "email": "@eventhough <kevindwusf@gmail.com>"
    },
    {
      "name": "Alan Shaw",
      "email": "@alanshaw <alan@tableflip.io>"
    }
  ],
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/dwyl/hapi-auth-jwt2/issues"
  },
  "homepage": "https://github.com/dwyl/hapi-auth-jwt2",
  "dependencies": {
    "boom": "^2.9.0",
    "cookie": "^0.2.2",
    "jsonwebtoken": "^5.4.0"
  },
  "devDependencies": {
    "aguid": "^1.0.3",
    "hapi": "^10.4.1",
    "codeclimate-test-reporter": "^0.1.1",
    "istanbul": "^0.3.22",
    "jshint": "^2.8.0",
    "pre-commit": "^1.1.1",
    "tap-spec": "^4.1.0",
    "tape": "^4.2.1"
  },
  "engines": {
    "node": ">=4.0"
  },
  "scripts": {
    "quick": "./node_modules/tape/bin/tape ./test/*.js | node_modules/tap-spec/bin/cmd.js",
    "test": "istanbul cover ./node_modules/tape/bin/tape ./test/*.js  | node_modules/tap-spec/bin/cmd.js",
    "coverage": "istanbul cover ./node_modules/tape/bin/tape ./test/*.js && istanbul check-coverage --statements 100 --functions 100 --lines 100 --branches 100",
    "jshint": "./node_modules/jshint/bin/jshint -c .jshintrc --exclude-path .gitignore .",
    "start": "node example/server.js",
    "report": "open coverage/lcov-report/index.html"
  },
  "pre-commit": [
    "jshint",
    "coverage"
  ]
}
