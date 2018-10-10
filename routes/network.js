var express = require('express');
var router = express.Router();

const BlockChainService = require('../service/blockchain/blockchain');
const blockChainService = new BlockChainService();

const IO = require('../helpers/io');

router.post('/', (req, resp) => {
    var networkId = req.body.networkId;
    var result = blockChainService.initNetwork(networkId);
    IO.sendResponse(result, resp);
});

router.put('/', (req, resp) => {
    var networkId = req.body.networkId;
    var result = blockChainService.modifyNetwork(networkId);
    IO.sendResponse(result, resp);
});

module.exports = router;
