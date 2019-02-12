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

const crypto = require('crypto');
const https = require('https');

var config = {
    publicKey: "b2f5e41e068fe4c825530ce64952a37542a0be76354d844502fc6f9d52b8f182",
    privateKey: "c56d57db9f5b1e2c10b0a6133758cfa60dc161cee80b9254052e631308fafb84"
}

function signRequest(headers, content) {
    // Order header items
    var orderedHeaders = {};
    Object.keys(headers).sort().forEach(function(key) {
        orderedHeaders[key] = headers[key];
    });
    console.log("Ordered headers:", orderedHeaders);

    // Generate data to sign
    var data = '';
    Object.keys(orderedHeaders).forEach(function(key) {
        data += key.toLowerCase() + orderedHeaders[key];
    });
    data += content;
    console.log('Data to sign:', data);

    // Generate signature
    hmac = crypto.createHmac('sha512', config.privateKey).update(data);
    var signature = hmac.digest('hex');
    console.log('Signature: ' + signature);
    return signature;
}

function buildRequestHeaders(content) {
    var headers = {
        "B1-Signature-Version": 2,
        "B1-Api-Key": config.publicKey,
        "B1-Time": Math.floor(new Date() / 1000),
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(content)
    }
    headers['B1-Signature'] = signRequest(headers, content);
    return headers;
}

function makeRequestToB1() {
    var dataToSubmit = {
        name: 'Du gaideliai',
        locationId: 1
    };
    var dataToSubmitAsString = JSON.stringify(dataToSubmit);
    var headers = buildRequestHeaders(dataToSubmitAsString);
    var requestOptions = {
        host: 'www.b1.lt',
        port: 443,
        path: '/api/clients/create',
        method: 'POST',
        headers: headers
    };
    var req = https.request(requestOptions, function(res) {
        console.log("Response status code:", res.statusCode);
        console.log("Response headers:", res.headers);
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
           console.log('Response body:', JSON.parse(chunk));
        });
    });
    req.end(dataToSubmitAsString);
}

makeRequestToB1();

module.exports = app;
