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

router.post('/createTask', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    const key = req.body.key;
    const passphrase = req.body.passphrase;
    const id = req.body.id;
    const token = req.body.token;
    const taskOwner = req.body.taskOwner;
    let result = await blockchainService.createTask(key, passphrase, id, token, taskOwner);
    IO.sendResponse(result, res);
});

router.post('/addAssignee', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    const key = req.body.key;
    const passphrase = req.body.passphrase;
    const id = req.body.id;
    const assignee = req.body.assignee;
    let result = await blockchainService.addAssignee(key, passphrase, id, assignee);
    IO.sendResponse(result, res);
});

router.post('/markCompleted', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    const key = req.body.key;
    const passphrase = req.body.passphrase;
    const id = req.body.id;
    let result = await blockchainService.markCompleted(key, passphrase, id);
    IO.sendResponse(result, res);
});

router.post('/markClosed', async (req, res) => {
    IO.logIncomingRequest(req);
    res.setHeader('Content-Type', 'application/json');
    const key = req.body.key;
    const passphrase = req.body.passphrase;
    const id = req.body.id;
    let result = await blockchainService.markClosed(key, passphrase, id);
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
