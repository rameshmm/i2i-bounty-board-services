const Nebulas = require('nebulas');
var TxEventLogger = require('../log/eventlogger');
var AppLogger = require('../log/applogger');
var ChainError = require('../error/chain_error');
const MAX_POLL_TRIES = 14;
const POLL_INTERVAL = 4000; //In ms
module.exports = class Transaction {

    static async send (neb, tx) {
      tx.signTransaction();
      var _this = this;
      return new Promise(function (resolve, reject) {
          neb.api.sendRawTransaction({
              data: tx.toProtoString()
          }).then((result) => {
              let txhash = result.txhash;
              AppLogger.logInfo(`Polling started for tx: ${txhash} submitted with nonce: ${tx.nonce}`);
              let tries = 0;
              let reached, resolved = false;
              let trigger = setInterval(() => {                                               
                  neb.api.getTransactionReceipt({ hash: txhash}).then((receipt) => {
                      tries++;
                      if(MAX_POLL_TRIES<tries && !reached) {
                          reached = true;
                          clearInterval(trigger);
                          AppLogger.logInfo(`Polling reached max tries for tx: ${txhash}, stopping polling service`);               
                          reject(new ChainError({message: `Tx ${txhash} in pending for too long`, txhash: txhash}));                     
                      }
                      if (receipt.status != 2 && !resolved) //not in pending
                      {
                          resolved = true;
                          clearInterval(trigger);
                          AppLogger.logInfo(`Tx: ${txhash} minted with status ${receipt.status}`);
                          TxEventLogger.aggregateEvents(neb, txhash);
                          if(receipt.status != 1) {
                              reject(receipt.execute_error);
                          }
                          resolve(txhash);
                      }
                  }).catch(function(err) {
                      reject(new ChainError({message: `Cannot check tx status, check if valid and available in pool: ${txhash}`, txhash: txhash}, err));
                  })
              }, POLL_INTERVAL);

          });
      });
    }

    static async sendAsync (neb, tx) {
        tx.signTransaction();
        var _this = this;
        var result = await neb.api.sendRawTransaction({data: tx.toProtoString()});        
        return result.txhash;
    } 
    
    static async create(neb, fromAccount, toAddress, amount, contract, isReadOnly) {
        var nebstate = await neb.api.getNebState();
        const value = Math.pow(10, 18) * amount;
        const Transaction = Nebulas.Transaction;
        var tx = new Transaction({
            chainID: nebstate.chain_id,
            from: fromAccount,
            to: toAddress,
            value: value,
            gasPrice: 1000000,
            gasLimit: 2000000,
            contract: contract
        });
        if (isReadOnly) {
            return tx;
        } else {
            const _nonce = await fromAccount.getNextNonce();
            tx.nonce = _nonce;
            return tx;
        }
    }
};
