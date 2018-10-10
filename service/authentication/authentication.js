var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const path = require('path');
const IO = require('../../helpers/io');

module.exports = class Authenticator {
    createToken(email, password) {
        if(email===process.env.CHAIN_EMAIL && password===process.env.CHAIN_PASSWORD) {
             var token = jwt.sign({ id: email }, process.env.CHAIN_SECRET, {expiresIn: parseInt(process.env.CHAIN_EXPIRATION_INSECS)});
             return IO.createSuccessReponse({auth: true, token: token});
        } else {
            return IO.createFailureResponse({auth: false, message: 'Invalid email/password', status: "0"});
        }
    }

    verifyToken(token) {
        var result = jwt.verify(token, process.env.CHAIN_SECRET, function(err, decoded) {
            if (err) {
                return IO.createFailureResponse({message: `${err.message}: ${token}`, status: 0});
            } else {
                if(decoded.id !== process.env.CHAIN_EMAIL) {
                    return IO.createFailureResponse({message: `Token: ${token} not matching with configured email id`, status: "0"});
                } else {
                    return IO.createSuccessReponse({auth: true});
                }
            }
        });
        return result;
    }
};
