var request = require('superagent');

module.exports.get = get;
module.exports.post = post;

function get (url) {
    return request.get(url);
}

function post (url) {
    return request.post(url);
}
