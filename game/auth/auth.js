var requests = require('../http/requests');
var data = require('../main/data');
var api = data.api;

var btn_signin;
var btn_signup;
var input_username;
var input_password;
var userData;

module.exports = function () {

    btn_signin = document.getElementById('btn_signin');
    btn_signup = document.getElementById('btn_signup');
    input_username = document.getElementById('username');
    input_password = document.getElementById('password');

    btn_signin.addEventListener('click', signin);
    btn_signup.addEventListener('click', signup);

}

function signin() {
    var url = api.dev + '/auth/signin';

    userData = {
        username : input_username.value,
        password : input_password.value
    };

    var resp = requests.post(url, null)
        .type('form')
        .send(userData)
        .set('Accept', /application\/json/)
        .end(function(err, r){
            var res = parsetext(r.text);
            console.log(res.message);
        });
}

function signup() {
    var url = api.dev + '/auth/signup';
    
    userData = {
        username : input_username.value,
        password : input_password.value
    };

    var resp = requests.post(url)
        .send(userData)
        .end(function (err, r){
            var res = parsetext(r.text);
            console.log(res.message);
        });

}

function parsetext (text) {
    return JSON.parse(text);
}