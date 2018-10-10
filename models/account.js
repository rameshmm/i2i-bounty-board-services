const Nebulas = require('nebulas');

const Account = Nebulas.Account;
const Transaction = require('./transaction');
const unit = Nebulas.Unit;
const ClientError = require('../error/client_error');
const AppError = require('../error/app_error');
var nonces = {};

Account.isValid = function(keystore, passphrase) {
    try {
        var account = Account.NewAccount();
        account.fromKey(keystore, passphrase, true);
        return true;
    } catch(error) {
        return false;
    } 
}

Account.prototype.init = function(neb, keystore, passphrase) {
    this.keystore = keystore;
    this.passphrase = passphrase;
    this.neb = neb;
    try {
        return this.fromKey(this.keystore, this.passphrase, true);
    } catch(error) {        
        throw new ClientError({message: keystore.address+" - "+(!error.message ? error : error.message)}, error);
    }    
};

Account.prototype.transferNas = async function(to, amount) {    
    try {
        var tx = await Transaction.create(this.neb, this, to, amount, null, false);
        var hash = await Transaction.sendAsync(this.neb, tx);
        return hash;
    } catch(error) {        
        throw new ClientError({message: `Transfer NAS from ${this.getAddressString()} to ${to} failed for NAS ${amount} `+(!error.message ? error : error.message)}, error);
    }    
};

Account.prototype.getNextNonce = async function() {
    const _this = this;
    const address = _this.getAddressString();
    const accstate = await _this.neb.api.getAccountState(address);
    const confirmedNonce = parseInt(accstate.nonce) + 1;
    var nonceNow = confirmedNonce;
    if (nonces.hasOwnProperty(address)) {
        const totalNonce = nonces[address] + 1;
        if (confirmedNonce < totalNonce) {
            nonceNow = totalNonce;
        }
    }
    nonces[address] = nonceNow;
    return nonceNow;
};

Account.prototype.getState = async function() {
    try {
        var state =  await this.neb.api.getAccountState(this.getAddressString());
        state = state.result || state;
        state.balance = unit.fromBasic(state.balance);
        return state;
    } catch(error) {
        throw new AppError({message: this.getAddressString()+" - "+(!error.message ? error : error.message)}, error)
    }              
};


module.exports = Account;
