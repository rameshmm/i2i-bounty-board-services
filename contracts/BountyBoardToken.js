'use strict';

var BountyBoardToken = function() {

  LocalContractStorage.defineProperties(this, {
    _name: null,
    _symbol: null,
    _decimals: null,
    _owner: null,
    _totalSupply: {
      parse: function (value) {
        return new BigNumber(value);
      },
      stringify: function (o) {
        return o.toString(10);
      }
    },
    _minimumToken: {
      parse: function (value) {
        return new BigNumber(value);
      },
      stringify: function (o) {
        return o.toString(10);
      }
    }
  });

  LocalContractStorage.defineMapProperties(this, {
    "balances": {
      parse: function (value) {
        return new BigNumber(value);
      },
      stringify: function (o) {
        return o.toString(10);
      }
    },
    "credits": {
      parse: function (value) {
        return new BigNumber(value);
      },
      stringify: function (o) {
        return o.toString(10);
      }
    },
    "tasks": {
      parse: function (value) {
        return new BigNumber(value);
      },
      stringify: function (o) {
        return o.toString(10);
      }
    },
  });
}

BountyBoardToken.prototype = {
  init: function (name, symbol, decimals, totalSupply, minimumToken) {
    this._name = name;
    this._symbol = symbol;
    this._decimals = decimals | 0;
    this._totalSupply = new BigNumber(totalSupply).mul(new BigNumber(10).pow(decimals));
    this._minimumToken = new BigNumber(minimumToken).mul(new BigNumber(10).pow(decimals));   

    var from = Blockchain.transaction.from;
    this._owner = from;

    this.balances.set(from, this._totalSupply);
    this.transferEvent(true, from, from, this._totalSupply);
  },

  // Returns the name of the token
  name: function () {
    return this._name;
  },

  // Returns the symbol of the token
  symbol: function () {
    return this._symbol;
  },

  // Returns the number of decimals the token uses
  decimals: function () {
    return this._decimals;
  },

  totalSupply: function () {
    return this._totalSupply.toString(10);
  },

  minimumToken: function() {
    return this._minimumToken.toString(10);
  },

  balanceOf: function (owner) {
      var balance = this.balances.get(owner);

      if (balance instanceof BigNumber) {
          return balance.toString(10);
      } else {
          return "0";
      }
  },

  isValidValue: function(value) {
    return value.lt(0.0);
  },

  checkForLowBalance: function(tokenBalance, tokenToBeSent) {
    return tokenBalance.lt(tokenToBeSent);
  },

  loadToken: function(to, value) {    
    value = new BigNumber(value);   
    if (this.isValidValue(value)) {
      throw new Error("Invalid amount");
    }
    var from = Blockchain.transaction.from;
    var owner = this._owner;

    // Only admin can load tokens
    if (from.toString() !== owner.toString()) {
      return new Error("Not Authorized.");
    }

    var fromBalance = this.balances.get(from) || new BigNumber(0);
    var toBalance = this.balances.get(to) || new BigNumber(0);

    if (this.checkForLowBalance(fromBalance, value)) {
      throw new Error("Insufficient Balance");
    }
    this.balances.set(from, fromBalance.sub(value));
    this.balances.set(to, toBalance.add(value));

    this.transferEvent(true, from, to, value);
  },

  transferToken: function(to, value) {
    value = new BigNumber(value);
    if (this.isValidValue(value)) {
      throw new Error("Invalid amount");
    }

    var from = Blockchain.transaction.from;
    var fromBalance = this.balances.get(from) || new BigNumber(0);
    var toCredits = this.credits.get(to) || new BigNumber(0);

    if (this.checkForLowBalance(fromBalance, value)) {
      throw new Error("Insufficient Balance");
    } 
    this.balances.set(from, fromBalance.sub(value));
    this.credits.set(to, toCredits.add(value));

    this.transferEvent(true, from, to, value);
  },

  encashToken: function(value) {
    value = new BigNumber(value);
    if (this.isValidValue(value)) {
      throw new Error("Invalid amount");
    }

    var from = Blockchain.transaction.from;
    var owner = this._owner;
    var fromCredits = this.credits.get(from) || new BigNumber(0);
    var toBalance = this.balances.get(owner) || new BigNumber(0);

    if (this.checkForLowBalance(fromCredits, value)) {
      throw new Error("Insufficient Balance");
    }

    this.credits.set(from, fromCredits.sub(value));
    this.balances.set(owner, toBalance.add(value));

    this.transferEvent(true, from, to, value);
  },

  transfer: function (action, to, value) {
    value = new BigNumber(value);
    if (value.lt(0.0)) {
      throw new Error("Invalid amount");
    }

    var from = Blockchain.transaction.from;
    var balance = this.balances.get(from) || new BigNumber(0);
    var fromCredits = this.credits.get(from) || new BigNumber(0);
    var toCredits = this.credits.get(to) || new BigNumber(0);
    var toBalance = this.balances.get(to) || new BigNumber(0);

    if (action !== 'ENCASH' && balance.lt(value)) {
      throw new Error("Insufficient Balance.");
    }

    // Update sender and receiver balance
    if (action === 'LOAD') {
      this.balances.set(from, balance.sub(value));
      this.balances.set(to, toBalance.add(value));
    } else if (action === 'TRANSFER') {
      this.balances.set(from, balance.sub(value));
      this.credits.set(to, toCredits.add(value));
    } else if (action === 'ENCASH'){
      this.credits.set(from, fromCredits.sub(value));
      this.balances.set(to, toBalance.add(value));
    } 

    this.transferEvent(true, from, to, value);
  },

  updateMinimumToken: function(value) {
    var from = Blockchain.transaction.from;
    var owner = this._owner;

    if (from.toString() !== owner.toString()) {
      return new Error("Not Authorized.");
    }
    this._minimumToken = new BigNumber(value).mul(new BigNumber(10).pow(decimals));;
  },

  getMinimumToken: function() {
    return this._minimumToken;
  },

  getCreditBalance: function(owner) {
    var credits = this.credits.get(owner);

    if (credits instanceof BigNumber) {
        return credits.toString(10);
    } else {
        return "0";
    }
  },

  transferEvent: function (status, from, to, value) {
    Event.Trigger(this.name(), {
      Status: status,
      Transfer: {
        from: from,
        to: to,
        value: value
      }
    });
  },
}

module.exports = BountyBoardToken;