const Contract = require('./contract');
const Util = require('../helpers/util');

module.exports = class Token {
    constructor(neb, contractAddress) {
        this.contract = new Contract(neb, contractAddress);
    }

    setContractAddress(address) {
        this.contract.setContractAddress(address);
    }

    async transferToken(fromAccount, toAddress, value, isAsync) {
        const args = [];
        args.push(Util.createStr(toAddress));
        args.push(value);
        const hash = await this.contract.execute(fromAccount, 'transferToken', args, 0, isAsync);
        return hash;
    }

    async loadToken(fromAccount, toAddress, value, isAsync) {
        const args = [];
        args.push(Util.createStr(toAddress));
        args.push(value);
        const hash = await this.contract.execute(fromAccount, 'loadToken', args, 0, isAsync);
        return hash;
    }

    async encashToken(fromAccount, toAddress, value, isAsync) {
        const args = [];
        args.push(Util.createStr(toAddress));
        args.push(value);
        const hash = await this.contract.execute(fromAccount, 'encashToken', args, 0, isAsync);
        return hash;
    }

    async balanceOf(fromAccount) {
        const args = [];
        args.push(Util.createStr(fromAccount.getAddressString()));
        const response = await this.contract.query(fromAccount, 'balanceOf', args);
        return response;        
    }

    async getCreditBalance(fromAccount) {
        const args = [];
        args.push(Util.createStr(fromAccount.getAddressString()));
        const response = await this.contract.query(fromAccount, 'getCreditBalance', args);
        return response;        
    }
};
