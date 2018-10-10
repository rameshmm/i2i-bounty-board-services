/**
 * @author Madan
 */
module.exports = class ChainError extends Error {  
  constructor(error, traceError){
    super(error.message)
    this.status = "-4";
    this.txhash = error.txhash;
    if (traceError) {
        this.original = "'"+traceError+"'";
        this.new_stack = this.stack;
        let message_lines =  (this.message.match(/\n/g)||[]).length + 1;
        this.stack_flow = this.stack.split('\n').slice(0, message_lines+1).join('\n') + '\n' +
                 traceError.stack;
    }
  }
};
