const Contract = require('./contract');
const Util = require('../helpers/util');

module.exports = class Task {
  constructor(neb, contractAddress) {
    this.contract = new Contract(neb, contractAddress);
  }

  setContractAddress(address) {
    this.contract.setContractAddress(address);
  }

  async createTask(fromAccount, id, token, assignees, taskOwner, isAsync) {
    const args = [];
    args.push(Util.createStr(id));
    args.push(token);
    args.push(assignees);
    args.push(taskOwner);
    const hash = await this.contract.execute(fromAccount, 'createTask', args, 0, isAsync);
    return hash;
  }

  async addAssignee(fromAccount, id, assignee, isAsync) {
    const args = [];
    args.push(id);
    args.push(assignee);
    const hash = await this.contract.execute(fromAccount, 'addAssignee', args, 0, isAsync);
    return hash;
  }

  async addAssignee(fromAccount, id, isAsync) {
    const args = [];
    args.push(id);
    const hash = await this.contract.execute(fromAccount, 'markCompleted', args, 0, isAsync);
    return hash;
  }

};
