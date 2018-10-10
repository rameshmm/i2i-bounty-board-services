const Logger = require('./logger');

/**
 * @author Madan
 */
module.exports = class AppLogger {    

    static logInfo(message, printToConsole) {
        Logger.info(message, printToConsole);        
    }

    static logDebug(message, printToConsole) {
        Logger.debug(message, printToConsole);        
    }

    static logError(message, error, printToConsole) {
        Logger.error(message, printToConsole);
        Logger.error(error, printToConsole);              
    }
};
