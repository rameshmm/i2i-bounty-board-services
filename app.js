"use strict";
const path = require('path');
var PropertiesReader = require('properties-reader');
var envs = PropertiesReader(path.resolve(__dirname, '.env.example'));

const AuthenticatorService = require('./service/authentication/authentication');
const authenticatorService = new AuthenticatorService();

const BlockChainService = require('./service/blockchain/blockchain');
const blockChainService = new BlockChainService();

var authenticationRouter = require('./routes/authentication');
var networkRouter = require('./routes/network');
var accountRouter = require('./routes/account');

const IO = require('./helpers/io');

const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    console.log('******************', req.originalUrl, req.body);
    if (req.originalUrl === '/auth/register') {
        return next();
    } else {
        verifyToken(req, res, next, verifyNetwork);               
    }
});

app.use('/auth', authenticationRouter);
app.use('/network', networkRouter);
app.use('/account', accountRouter);

verifyEnvVariables();
blockChainService.initNetwork();

var verifyNetwork = function(req, res, next) {
    if (req.originalUrl !== '/network' && !blockChainService.isInitialized()) {
        IO.sendResponse(IO.createFailureResponse({message:"Network not initialized.."}), res);
    } else {
        return next();
    }
}

function verifyToken(req, res, next, cb) {
    res.setHeader('Content-Type', 'application/json');
    var token = req.headers['x-access-token'];
    if (!token) return res.status(400).send({ auth: false, message: 'No token provided.' });
    var result = authenticatorService.verifyToken(token);
    if(result.result && result.result.auth) {
        cb(req, res, next);
    } else {
        IO.sendResponse(result, res);
    }    
}

function verifyEnvVariables() {
    var undefinedEnvs = [];
    for(var i in envs._properties) {
        if (typeof process.env[i] === 'undefined') {
            undefinedEnvs.push(i);
        }
    }
    if(undefinedEnvs.length>0) {
        console.log("The following env variables are not set or empty, refer .env.example and make sure you set values for all");
        console.log(undefinedEnvs.toString());
        console.log("Exiting...");
        process.exit(1);        
    }
}

app.listen(process.env.PORT || 3004);
