var User = require('../model/auth');
module.exports.signin = signin;
module.exports.signup = signup;

function signin (req, res) {

    if (!req.body.username || !req.body.password) {
        return res.json({
            success : false, 
            message : 'Provide all needed info.'
        });
    }
    User.findOne({
        username : req.body.username
    }).select('username password').exec(function (err, user) {
        console.log(user);
        if (err) throw err;
        if (!user){
            res.json({
                success : false,
                message : 'Sorry, wrong username provided!'
            });
        }
        else if (user){
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                res.json({
                    success : false,
                    message : 'Sorry, wrong password provided!'
                });
            }
            else {
                res.json({
                    success : true,
                    message : 'Successfully Logged',
                    username : user.username
                });
            }
        }
    });
}


function signup (req, res) {
    var user = new User();

    if (!req.body.username || !req.body.password) {
        return res.json({
            success : false, 
            message : 'Provide all needed info to signup!'
        });
    }

    user.username = req.body.username;
    user.password = req.body.password;
    
    user.save(function (err) {
        if (err) {
            if (err.code == 11000)
                return res.json({
                    success : false,
                    message : 'Sorry, this username or email already exists'
                })
            else
                return res.send({
                    success : false,
                    message : err
                });
        }
        res.json({
            success : true,
            message : 'Successfully created',
        });
    });
}
