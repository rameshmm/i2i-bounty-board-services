var express = require('express');
var router = express.Router();

const AuthenticatorService = require('../service/authentication/authentication');
const authenticatorService = new AuthenticatorService();

const IO = require('../helpers/io');

router.post('/register', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var email = req.body.email;
    var password = req.body.password;
    var result = authenticatorService.createToken(email, password);
    IO.sendResponse(result, res);
});

module.exports = router;
