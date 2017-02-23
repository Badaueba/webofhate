var requests = require('../http/requests');
// params = {}

function signin() {
    console.log('signin');
    var input_username = document.getElementById('username');
    var resp = requests.get('www.google.com/', null)
        .then(function(err, resp){
            console.log(resp);
        });
}

module.exports = function (params) {
    var btn_signin = document.getElementById('btn_signin');
    btn_signin.addEventListener('click', signin());
}
