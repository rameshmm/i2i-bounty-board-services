'use strict'
class Task {
  constructor(task) {
    if (task) {
      const taskObj = JSON.parse(task);
      this.id = taskObj.id;
      this.token = taskObj.token;
      this.assignees = taskObj.assignees;
      this.taskOwner = taskObj.taskOwner;
      this.isCompleted = taskObj.isCompleted || false;
    } else {
      this.id = null;
      this.token = null;
      this.assignees = null;
      this.taskOwner = null;
      this.isCompleted = false;
    }    
  }
}

class TaskContract {

  constructor() {

    LocalContractStorage.defineProperties(this, {
      _contractAddress: null,
      _owner: null
    });

    LocalContractStorage.defineMapProperties(this, {
      "tasks": {
        parse: function (task) {
          return new Task(task);
        },
        stringify: function (task) {
          return JSON.stringify(task);
        }
      },
      "taskTokens": {
        parse: function (value) {
          return new BigNumber(value);
        },
        stringify: function (o) {
          return o.toString(10);
        }
      }
    });
  }

  init(contractAddress) {
    this._contractAddress = contractAddress;
    this._owner = Blockchain.transaction.from;

    this._contractEvent(contractAddress);
  }

  owner() {
    return this._owner;
  }

  contractAddress() {
    return this._contractAddress;
  }

  modifyContractAddress(contractAddress) {
    const from = Blockchain.transaction.from;

    // Only smart contract owner can modify a contract address
    if (from !== this.owner()) {
      throw new Error('Not Authorized.');
    }

    this._contractAddress = contractAddress;
  }

  createTask(id, token, assignees, taskOwner) {
    const from = Blockchain.transaction.from;
    const walletContract = new Blockchain.Contract(this.contractAddress());

    const taskOwnerBalance = new BigNumber(this._getTokenBalance(walletContract, taskOwner));
    const taskTokenBalance = this.taskTokens.get(taskOwner) || new BigNumber(0);
    token = new BigNumber(token);  

    // Only smart contract owner can create a task
    if (from !== this._getWalletOwner(walletContract)) {
      throw new Error('Not Authorized to create a task.');
    }

    // Task owner should have valid token balance
    if (this._isLessThan(taskOwnerBalance, token) ||
      this._isLessThan(taskOwnerBalance, token.add(taskTokenBalance))) {
      throw new Error('Insufficient token balance.');
    }

    const task = new Task();
    task.id = id;
    task.token = token;
    task.assignees = assignees;
    task.taskOwner = taskOwner;
    this.tasks.set(id, task);

    // Update task owner token balance
    this.taskTokens.set(taskOwner, token);

    this._taskEvent(id, task);
  }

  addAssignee(taskId, assignee) {
    const from = Blockchain.transaction.from;

    // Only smart contract owner can update a task
    if (from !== this.owner()) {
      throw new Error('Not Authorized.');
    }
    const task = this.tasks.get(taskId);
    if(!task) {
      throw new Error('No task found');
    }
    task.assignees += assignee;
    this.tasks.set(taskId, task);
    this._taskEvent(taskId, task);
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  markCompleted(id) {
    const from = Blockchain.transaction.from;
    const walletContract = new Blockchain.Contract(this.contractAddress());
    const taskTokenBalance = this.taskTokens.get(task.taskOwner);

    // Only smart contract owner can update a task
    if (from !== this.owner()) {
      throw new Error('Not Authorized.');
    }

    const task = this.tasks.get(id);
    task.isCompleted = true;

    if (!task) {
      throw new Error('No task found');
    }
    
    // Update task token balance
    this.taskTokens.set(task.taskOwner, taskTokenBalance.sub(token));
    this.tasks.set(id, task);

    this._transferTaskToken(walletContract, task);
  }

  _taskEvent(id, task) {
    Event.Trigger('Task', {
      Transfer: {
        id,
        task
      }
    });
  }

  _contractEvent(contractAddress) {
    Event.Trigger('ContractAddress', {
      Contract: {
        contractAddress
      }
    });
  }

  _transferTaskToken(contract, task) {
    return contract.call("transferTaskToken", task);
  }

  _getTokenBalance(contract, key) {
    return contract.call("balanceOf", key);
  }

  _getWalletOwner(contract) {
    return contract.call("owner");
  }

  _isLessThan(value1, value2) {
    return value1.lt(value2);
  }
  
  _isValidValue(value) {
    return value.lt(0.0);
  }
};

module.exports = TaskContract;