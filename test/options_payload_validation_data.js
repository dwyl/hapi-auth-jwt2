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

var tokens = {};

for ( var p in people){
    tokens[p] = JWT.sign( people[p], secret);
}


var content = { // our "content/payload database"
    normal: {
        id: 1,
        text: 'Lorem ipsum dolor ..',
        permissions: 'may be edited by normal user'
    },
    important: {
        id: 2,
        text: '.. sit amet, ..',
        permissions: 'may not be edited by normal user, only by admin'
    },
};


module.exports = {
    people: people,
    tokens: tokens,
    content: content
}
