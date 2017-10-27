var env = process.env.NODE_ENV || 'dev';
var config = require("./" + env.toLowerCase());
module.exports = config;