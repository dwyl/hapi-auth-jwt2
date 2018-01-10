var JWT = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var people = { // our "users database"
    user: {
        id: 1,
        name: 'Jen Jones',
        role: 'user'
    },
    admin: {
        id: 2,
        name: 'Peter Serious',
        role: 'admin'
    },
};

// create JWT for each person in the people "database":
var tokens = Object.keys(people).reduce(function (obj, person) {
  obj[person] = JWT.sign( people[person], secret);
  return obj;
}, {});

var content = { // our "content/payload database"
    normal: {
        id: 1,
        text: 'Lorem ipsum dolor ..',
        permission: 'may be edited by normal user'
    },
    important: {
        id: 2,
        text: '.. sit amet, ..',
        permission: 'may not be edited by normal user, only by admin'
    },
};

module.exports = {
    people: people,
    tokens: tokens,
    content: content
}
