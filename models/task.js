const Contract = require('./contract');
const Util = require('../helpers/util');

module.exports = class Task {
  constructor(neb, contractAddress) {
    this.contract = new Contract(neb, contractAddress);
  }

  setContractAddress(address) {
    this.contract.setContractAddress(address);
  }

  async createTask(fromAccount, id, token, taskOwner, isAsync) {
    const args = [];
    args.push(Util.createStr(id.toString()));
    args.push(Util.createStr(token.toString()));
    args.push(Util.createStr(taskOwner.toString()));
    const hash = await this.contract.execute(fromAccount, 'createTask', args, 0, isAsync);
    return hash;
  }

  async addAssignee(fromAccount, id, assignee, isAsync) {
    const args = [];
    args.push(Util.createStr(id.toString()));
    args.push(Util.createStr(assignee.toString()));
    const hash = await this.contract.execute(fromAccount, 'addAssignee', args, 0, isAsync);
    return hash;
  }

  async markCompleted(fromAccount, id, isAsync) {
    const args = [];
    args.push(Util.createStr(id.toString()));
    const hash = await this.contract.execute(fromAccount, 'markCompleted', args, 0, isAsync);
    return hash;
  }

  async markClosed(fromAccount, id, isAsync) {
    const args = [];
    args.push(Util.createStr(id.toString()));
    const hash = await this.contract.execute(fromAccount, 'markClosed', args, 0, isAsync);
    return hash;
  }

};
