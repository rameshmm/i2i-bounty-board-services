const Transaction = require('./transaction');
 
module.exports = class Contract {    
    constructor(neb, address) {
        this.neb = neb;
        this.address = address;
    }

    setContractAddress(address) {
        this.address = address;
    }

    async execute(fromAccount, fnName, args, value, isAsyncExec) {
        const contractObj = this.createContractObj(fnName, args);
        var tx = await Transaction.create(this.neb, fromAccount, this.address, value, contractObj, false);
        if(isAsyncExec) {
            var hash = await Transaction.sendAsync(this.neb, tx);
        } else {
            var hash = await Transaction.send(this.neb, tx);
        }        
        return hash;      
    }

    async query(fromAccount, fnName, args) {
        const nebApi = this.neb.api;
        const contractObj = this.createContractObj(fnName, args);
        var tx = await Transaction.create(this.neb, fromAccount, this.address, 0, contractObj, true);
        tx.from = fromAccount.getAddressString();
        tx.to = this.address;
        var response = await this.neb.api.call(tx);
        return (JSON.parse(response.result));
    }

    createContractObj(fnName, args) {
        this.args = args;
        const contract = {};
        contract.function = fnName;
        contract.args = `[${args.join(',')}]`;
        return contract;
    }
};
