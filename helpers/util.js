module.exports = class Util {
  static createStr(value) {
    return `"${value.replace(/"/g,'')}"`;
  }
};
