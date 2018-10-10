
var responseCodes = {0: 401, 1: 200, "-1": 500, "4": 422, "-4": 504};
var statusCodes = {0: "Permission denied", 1: "Success", "-1": "Failure", "4": "Invalid parameters or credentials", "-4": "Blockchain Query timeout"};

const AppLogger = require('../log/applogger');

module.exports = class IO {  
  static sendResponse(result, response) {
      response.status(responseCodes[result.status]).send({status: statusCodes[result.status], message: result.message, result: result.result})
  }
  
  static createSuccessReponse(response) {
      const result = {};
      result.status = 1;
      result.result = response;
      return result;
  }

  static createFailureResponse(error) {      
      const result = {};
      result.status = (typeof (error.status)!=="undefined") ? error.status : "-1";
      result.message = !error.message ? error : error.message;
      AppLogger.logError("Error returned from API: "+result.message, error, true);
      return result;
  }

  static logIncomingRequest(req) {
      var params = req.body;
      if(req.method==="GET") {
          params = req.params;
      }
      AppLogger.logDebug(`Incoming request for ${req.path} with ${JSON.stringify(params)}`);
  }
};
