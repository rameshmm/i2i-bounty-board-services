"use strict";
var PropertiesReader = require('properties-reader');
var path = require('path');
var Logger = require('logdna');

var isLocalMode = process.env.LOCAL_MODE && process.env.LOCAL_MODE=="true";
const opts = {
    //hostname:process.env.LOGDNA_HOST,
    app: process.env.LOGDNA_APP,
};

var log = Logger.setupDefaultLogger(process.env.LOGDNA_KEY, opts);

module.exports = class Logger {
  static info(message, printToConsole) {
    if(!isLocalMode) {
      log.log(message, "info");
    }
    if(isLocalMode || printToConsole) {
      console.log(message);
    }    
  }

  static error(message, printToConsole) {
    if(!isLocalMode) {
      log.log(message, "error");
    }
    if(isLocalMode || printToConsole) {
      console.log(message);
    }
  }

  static debug(message, printToConsole) {
    if(!isLocalMode) {
      log.log(message, "debug");
    }
    if(isLocalMode || printToConsole) {
      console.log(message);
    }
  }
};
