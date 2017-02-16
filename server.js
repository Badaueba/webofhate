var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var dataConfig = require('./config/data_config');
var deployConfig = require('./config/deploy_config');
var cookieParser = require('cookie-parser');
var app = express();
var bodyParser = require('body-parser');
var path = require("path");
var http = require("http");

mongoose.connect(dataConfig.database);

app.use(express.static(__dirname + "/public"));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extend: true}));
app.use(bodyParser.json());
app.use(cookieParser());

//configure our app tho handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Client-Offset");
    next();
});

var auth = require("./app/auth/route/auth");
app.use("/auth", auth);

app.use("*", function (req, res) {
    res.sendFile(path.join( __dirname + "/public/index.html"))
})

var server = http.createServer(app);
var socket = require("./app/socket/route/socket");

server.listen(deployConfig.port, function () {
    socket.init(server);
    console.log("listening on " + deployConfig.port );
});
