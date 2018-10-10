const util = require('util');
const Logger = require('./logger');

/**
 * @author Madan
 */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["aggregateEvents",
logTransactionResult, logContractEvents, logTxFailure] }] */
module.exports = class TxEventLogger {    

    static async aggregateEvents(neb, txhash) {
        const result = await neb.api.getEventsByHash({
            hash: txhash
        });
        const {events} = result;
        Object.keys(events).forEach((key) => {
            const event = events[key];
            const data = JSON.parse(event.data);
            if (event.topic === 'chain.transactionResult') {
                if (data.error !== '' || data.status === 0) {
                    TxEventLogger.logTxFailure(data);
                } else {
                    TxEventLogger.logTransactionResult(data);
                }
            } else {
                TxEventLogger.logContractEvents(event, txhash);
            }
        });
    }

    static logTransactionResult(data) {
        Logger.info(`Tx executed : ${data.hash} gas used: , ${data.gas_used}`);
    }

    static logContractEvents(event, hash) {
        Logger.debug(`Events traced for tx: ${hash}::${util.inspect(event)}`);
    }

    static logTxFailure(data) {
        Logger.error(`Tx failed: ${data.hash} Reason: ${data.error}`);
    }
};
