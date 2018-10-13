const Nebulas = require('nebulas');
const Token = require('../../models/token');
const Task = require('../../models/task');
const Account = require('../../models/account');
const NebulasNeb = Nebulas.Neb;
const IO = require('../../helpers/io');

const ClientError = require('../../error/client_error.js');

const path = require('path');
var escrow, payment, token, task;
var neb = new NebulasNeb();
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(path.resolve(__dirname, '../../config/chain.properties'));

const AppLogger = require('../../log/applogger');

const networks = {
    0: "main",
    1: "test",
    2: "private"
};

const v3 = '{"address":"n1H4MYms9F55ehcvygwWE71J8tJC4CRr2so","crypto":{"cipher":"aes-128-ctr","ciphertext":"75f814c2393ba63445dbab278f7b53cedbadc338a77664ccfb1656c81eeba27d","cipherparams":{"iv":"4a2f57ddd9eaad908904364483c1c943"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":4096,"p":1,"r":8,"salt":"a14af20b1e59da3ab38e37f2b5607a7a2166e1418852dd1a49d65d9342540b27"},"mac":"a9a726f43a45f0c248dadbaa8ab83036e1f3994bc330cedb5454666702fe69e9","machash":"sha3256"},"id":"40b6ee5e-142e-411f-97c5-dcfcdc44378d","version":3}';

const ownedaccount = new Account();
ownedaccount.init(neb, v3, 'passphrase');

function init(networkId) {
    var network = networks[networkId];
    if(!network) {
        throw new Error("Invalid network id: "+networkId);
    }
    neb.setRequest(new Nebulas.HttpRequest(properties.get(network + '.url')));
    token = new Token(neb, properties.get(network + '.contract.token.address'));
    task = new Task(neb,  properties.get(network + '.contract.token.address'));
    AppLogger.logInfo("Network successfully initialized to: "+network, true);
}

module.exports = class Blockchain {
    isInitialized() {
        return typeof (neb._request)!=="undefined";
    }

    initNetwork() {
        init(process.env.NETWORK || 1);
    }

    modifyNetwork(networkId) {
        try {
            return modify(networkId);           
        } catch(error) {
            AppLogger.logError("Problem modifying network", error, true);
            return IO.createFailureResponse(error);
        }
    }

    createAccount(passphrase) {
        var keyStr = '';
        try {
            let account = Account.NewAccount();
            keyStr = account.toKeyString(passphrase);
        } catch(error) {            
            return IO.createFailureResponse(error);
        }
        return IO.createSuccessReponse(keyStr);
    }

    validateAccount(key, passphrase) {
        var isValid = Account.isValid(key, passphrase);        
        return IO.createSuccessReponse(isValid);
    }

    async deposit(keys, transactionId, assertId, passphrase, assertType) {        
        try {
            const account = new Account();
            account.init(neb, keys, passphrase);                      
            const depositResult = await escrow.deposit(transactionId, account, assertId, assertType);
            return IO.createSuccessReponse(depositResult);       
        } catch(error) {
            return IO.createFailureResponse(error);  
        }
    }

    async getTokenBalance(key, passPhrase) {
        try {
            const account = new Account();
            account.init(neb, key, passPhrase);
            const balance = await token.balanceOf(account);
            return IO.createSuccessReponse(balance);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async getCreditBalance(key, passPhrase) {
        try {
            const account = new Account();
            account.init(neb, key, passPhrase);
            const balance = await token.getCreditBalance(account);
            return IO.createSuccessReponse(balance);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async getAccountState(key, passPhrase) {
        try {
            const account = new Account();
            account.init(neb, key, passPhrase);
            const state = await account.getState();
            return IO.createSuccessReponse(state);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async getNasBalance(key, passPhrase) {
        try {
            const account = new Account();
            account.init(neb, key, passPhrase);
            const state = await account.getState();
            return IO.createSuccessReponse(state.balance);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async transferToken(key, passPhrase, toAddress, amount) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await token.transferToken(fromAccount, toAddress, amount, true);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async nasTransfer(key, passPhrase, toAddress, amount) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await fromAccount.transferNas(toAddress, amount);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async loadToken(key, passPhrase, toAddress, amount) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await token.loadToken(fromAccount, toAddress, amount, true);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async encashToken(key, passPhrase, toAddress, amount) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await token.encashToken(fromAccount, toAddress, amount, true);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async createTask(key, passPhrase, id, token, assignees, taskOwner) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await task.createTask(fromAccount, id, token, assignees, taskOwner, true);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async addAssignee(key, passPhrase, id, assignee) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await task.addAssignee(fromAccount, id,assignee, true);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }

    async markCompleted(key, passPhrase, id) {
        try {
            const fromAccount = new Account();
            fromAccount.init(neb, key, passPhrase);
            var result = await task.markCompleted(fromAccount, id, true);
            return IO.createSuccessReponse(result);
        } catch(error) {
            return IO.createFailureResponse(error);
        }
    }
};
