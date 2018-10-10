var express = require('express');
var router = express.Router();

const BlockchainService = require('../service/blockchain/blockchain');
const blockchainService = new BlockchainService();

const IO = require('../helpers/io');

router.post('/tokenBalance', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    let result = await blockchainService.getTokenBalance(key, passphrase);    
    IO.sendResponse(result, res);
});

router.post('/creditBalance', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    let result = await blockchainService.getCreditBalance(key, passphrase);    
    IO.sendResponse(result, res);
});

router.post('/nasBalance', async (req, res) => {    
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    let result = await blockchainService.getNasBalance(key, passphrase);    
    IO.sendResponse(result, res);
});

router.post('/transferToken', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    var toAddress = req.body.toAddress;
    var token = req.body.token;
    let result = await blockchainService.transferToken(key, passphrase, toAddress, token);
    IO.sendResponse(result, res);
});

router.post('/loadToken', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    var toAddress = req.body.toAddress;
    var token = req.body.token;
    let result = await blockchainService.loadToken(key, passphrase, toAddress, token);
    IO.sendResponse(result, res);
});

router.post('/encashToken', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    var toAddress = req.body.toAddress;
    var token = req.body.token;
    let result = await blockchainService.encashToken(key, passphrase, toAddress, token);
    IO.sendResponse(result, res);
});

router.post('/transferNas', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    var toAddress = req.body.toAddress;
    var amount = req.body.amount;
    let result = await blockchainService.nasTransfer(key, passphrase, toAddress, amount);
    IO.sendResponse(result, res);
});

router.post('/create', (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    var passphrase = req.body.passphrase;
    var result = blockchainService.createAccount(passphrase);
    IO.sendResponse(result, res);
});

router.post('/state', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var key = req.body.key;
    var passphrase = req.body.passphrase;
    let result = await blockchainService.getAccountState(key, passphrase);    
    IO.sendResponse(result, res);
});

module.exports = router;
