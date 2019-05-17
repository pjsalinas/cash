const _ = require('lodash');

exports.pronto = {
  ADD: 'Add Entry',
  LAST: 'Last transactions',
  BALANCE: 'Transactions for Today',
  AVERAGE: 'Transactions Average',
  STATUS: 'Snapshot',
  PROJECTED: 'Projected cash left',
  DISCRETIONARY: 'Discretionary Entries',
  DIS: 'Discretionary Entries',
  FINANCIAL: 'Financial Entries',
  FIN: 'Financial Entries',
  COMMITTED: 'Committed Entries',
  COM: 'Committed Entries',
  TOPAY: 'Entries to Pay',
  UNPAID: 'Entries to Pay',
  REMOVE: 'Remove Entry',
  HELP: 'Hey, "*/cash*" helps you to manage your daily expenses and bills.\nValid commands: `add`, `last`, `topay`, `discretionary`, and help`\n* To add a new entry: `/cash add "Entry Name", amount, category, date, true`\n* To list last 10 entries: `/cash last`',
};

exports.categories = ['FINANCIAL', 'COMMITTED', 'DISCRETIONARY'];

exports.keys = () => _.keys(exports.pronto);
