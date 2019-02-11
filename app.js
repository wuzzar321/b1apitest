var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var request = require('request');
const crypto = require('crypto');

var config = {
    publicKey: "b2f5e41e068fe4c825530ce64952a37542a0be76354d844502fc6f9d52b8f182",
    privateKey: "c56d57db9f5b1e2c10b0a6133758cfa60dc161cee80b9254052e631308fafb84"
}

function callB1() {

    var query = {
        "name": "uabtestena",
        "countryId": "1"
    };

    var hmacDataConstructor = "api-key" + config.publicKey + "content-length" + Buffer.byteLength(JSON.stringify(query)) + "content-typeapplication/json; charset=utf-8" + "platformstandalone" + "time" + Math.floor(new Date() / 1000) + "version2.0.6" + JSON.stringify(query);
    const hmac = crypto.createHmac('sha512', config.privateKey).update(hmacDataConstructor);

    console.log("hmac length is: " + hmac.digest('hex').length);
    console.log(hmacDataConstructor);

    var options = {
        url: "https://www.b1.lt/api/clients/create",
        qs: query,
        headers: {
            "B1-Api-Key": config.publicKey,
            "B1-Signature": hmac.digest('hex'),
            "B1-Time": Math.floor(new Date() / 1000),
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(JSON.stringify(query)),
            "B1-Version": "2.0.6",
            "B1-Platform": "standalone"
        }
    }

    function callback(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    }

    request(options, callback);
}

callB1();

module.exports = app;
