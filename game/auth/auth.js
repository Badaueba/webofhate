//dom
var btn_signin;
var btn_signup;
var input_username;
var input_password;
var userData;
var serverMessage;

//modules
var requests;
var storage;
var data;
var game;
var api;


module.exports = function () {

    requests = require('../http/requests');
    storage = require('../services/storage');
    data = require('../main/data');
    game = data.game;
    api = data.api;
    

    btn_signin = document.getElementById('btn_signin');
    btn_signup = document.getElementById('btn_signup');
    input_username = document.getElementById('username');
    input_password = document.getElementById('password');
    serverMessage = document.getElementById('serverMessage');

    btn_signin.addEventListener('click', signin);
    btn_signup.addEventListener('click', signup);
    btn_signin.addEventListener('touchstart', signin, false);
    btn_signup.addEventListener('touchstart', signup, false);
}

function signin() {

    var url = api + '/auth/signin';

    console.log('api', api);

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
            serverMessage.innerHTML = res.message;
            if (res.success) afterSuccess();
        });        
}

function signup() {
    var url = api + '/auth/signup';
    
    userData = {
        username : input_username.value,
        password : input_password.value
    };

    var resp = requests.post(url)
        .send(userData)
        .end(function (err, r){
            var res = parsetext(r.text);
            serverMessage.innerHTML = res.message;
            if (res.success) afterSuccess();
        });
}

function parsetext (text) {
    return JSON.parse(text);
}

function afterSuccess() {
    game.state.start('menu');
    storage.setItem('user', input_username.value);
    $('authModal').hide();
}
