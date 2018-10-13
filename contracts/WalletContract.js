'use strict'

class WalletContract {
  constructor() {
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
      }
    });
    LocalContractStorage.defineMapProperty(this, "accepts");
  }

  init(name, symbol, decimals, totalSupply, minimumToken) {
    this._name = name;
    this._symbol = symbol;
    this._decimals = decimals;
    this._totalSupply = new BigNumber(totalSupply).mul(new BigNumber(10).pow(decimals));
    this._minimumToken = minimumToken;

    const from = Blockchain.transaction.from;
    this._owner = from;

    this.balances.set(from, this._totalSupply);
    this._transferEvent(true, from, from, this._totalSupply);
  }

  name() {
    return this._name;
  }

  symbol() {
    return this._symbol;
  }
  
  decimals() {
    return this._decimals;
  }

  totalSupply() {
    return this._totalSupply.toString(10);
  }

  owner() {
    return this._owner;
  }

  balanceOf(owner) {
    const balance = this.balances.get(owner);
    if (balance instanceof BigNumber) {
      return balance.toString(10);
    } else {
      return "0";
    }
  }

  getCreditBalance(owner) {
    const credits = this.credits.get(owner);
    if (credits instanceof BigNumber) {
        return credits.toString(10);
    } else {
        return "0";
    }
  }

  loadToken(receiver, token) {
    const sender = Blockchain.transaction.from;
    const senderBalance = this.balances.get(sender) || new BigNumber(0);
    const receiverBalance = this.balances.get(receiver) || new BigNumber(0);
    token = new BigNumber(token);  

    // Only smart contract owner can load token
    if (sender !== this.owner()) {
      throw new Error('Not Authorized to create a task.');
    }

    // Owner should have valid token balance
    if (this._isLessThan(senderBalance, token)) {
      throw new Error('Insufficient token balance.');
    }
     
    if (this._isValidValue(token)) {
      throw new Error("Invalid amount");
    }

    // Update sender and receiver balance
    this.balances.set(sender, senderBalance.sub(token));
    this.balances.set(receiver, receiverBalance.add(token));

    this._transferEvent(true, sender, receiver, token);
  }

  encashToken(token) {
    const sender = Blockchain.transaction.from;
    const senderCreditBalance = this.credits.get(sender) || new BigNumber(0);
    const receiverBalance = this.balances.get(this.owner()) || new BigNumber(0);
    token = new BigNumber(token); 

    if (this._isLessThan(senderBalance, token)) {
      throw new Error('Insufficient token balance.');
    }

    if (this._isValidValue(token)) {
      throw new Error("Invalid amount");
    }

    // Update sender credit balance and receiver balance
    this.credits.set(sender, senderCreditBalance.sub(token));
    this.balances.set(receiver, receiverBalance.add(token));

    this._transferEvent(true, sender, receiver, token);
  }

  getFrom() {
    return Blockchain.transaction.from;
  }

  transferTaskToken(task) {
    const from = Blockchain.transaction.from;

    // Only approved smart contract can perform token transfer
    if (!this.accepts.get(from)) {
      throw new Error('Not Authorized.');
    }
    
    const fromBalance = this.balances.get(task.taskOwner) || new BigNumber(0);
    const assignees = task.assignees.split(',');
    const token = Math.floor(new BigNumber(task.token) / assignees.length);
    let toCreditBalance;

    for(let assignee of assignees) {
      toCreditBalance = this.credits.get(assignee) || new BigNumber(0);
      // Update sender balance and receiver credit balance
      this.balances.set(task.taskOwner, fromBalance.sub(token));
      this.credits.set(assignee, toCreditBalance.add(token));
      this._transferEvent(true, task.taskOwner, assignee, token);
    }    
  }

  updateAccess(contractAddress) {
    const from = Blockchain.transaction.from;

    // Only smart contract owner can update a task
    if (from !== this.owner()) {
      throw new Error('Not Authorized.');
    }

    this.accepts.set(contractAddress, "true");
  }

  getAccess(contractAddress) {
    return this.accepts.get(contractAddress);
  }

  _transferEvent(status, from, to, value) {
    Event.Trigger(this.name(), {
      Status: status,
      Transfer: {
        from,
        to,
        value
      }
    });
  }

  _isLessThan(value1, value2) {
    return value1.lt(value2);
  }
  
  _isValidValue(value) {
    return value.lt(0.0);
  }
};

module.exports = WalletContract;