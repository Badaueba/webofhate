/**
 * Created by alan on 05/07/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    username : {type: String, required: true, index : {unique : true} },
    password : {type: String, required: true, select: false}
});

//hash the password before user is saved
UserSchema.pre('save', function (next) {
    var user = this;
    //hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    //generate the hash
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);
        //change the password to the hashed version
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};
//return model
module.exports = mongoose.model('User', UserSchema);
