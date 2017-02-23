var request = require('superagent');

module.exports.get = get;
module.exports.post = post;

function get (url, params) {
    return request.get(url)
        .end(function (err, res){
            console.log(res);
        })
}


function post (url, data, params, callback) {

}