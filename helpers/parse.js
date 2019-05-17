const _ = require('lodash');
const moment = require('moment');

const actions = require('../helpers/actions');

const parse = (text) => {
/* to types of request are possible:
 * a) add request: /cash add Bill Name, 100, financials, 2019-03-05, true
 *    Add Bill Name for the amount of $100 that belongs to
 *    the Financial category on March 05, 2019 and mark it as paid.
 * b) any other request:
 *    /cash last
 *    /cash average
 *    /cash discretionary or /cash dis
 */

  let toEvaluate; let isValid = true; let wrongInput; let name; let amount; let category; let date; let
    paid;

  // Split the text by the character ","
  const splittedText = _.split(text, ",");

  // get the first term of the splitted text
  const first = splittedText[0];

  // get the action to perform
  const action = _.toUpper(_.first(_.split(first, " ")));

  // get the "pronto" response to avoid 3 secs rule on Slack
  const pronto = actions.pronto[action];

  // check response again valid responses
  if (_.isUndefined(pronto)) {
    isValid = false;
    wrongInput = `*${action}* is not a valid action.`;
  } else if (action === 'ADD') { // if action is "ADD", go over all the components
    // name, is the name of the bill
    name = _.trim(_.join(_.drop(_.split(first, " ")), " "));
    if (_.isUndefined(name) || _.isEmpty(name) || name.length === 0) {
      isValid = false;
      wrongInput += `\n*Name* is "undefined" or "empty"`;
    }

    // amount, is the dollar amount of the bill
    amount = _.trim(splittedText[1]) * 1;
    if (_.isNaN(_.trim(splittedText[1])) * 1) {
      isValid = false;
      wrongInput += `\n*${(_.trim(splittedText[1]) * 1)}*  NOT a valid "amount".`;
    }

    // category, is one of the following: Financial, Committed, or Discretionary
    // If there isn't any them set it to "Discretionary" (more frequent one)
    category = _.trim(_.toUpper(splittedText[2]));
    if (!_.includes(actions.categories, category)) {
      category = 'DISCRETIONARY';
    }

    // date: it's the date of the entry w/format 'YYYY-MM-DD' or 'MM/DD/YYYY' or 'dd'
    // format: 2019-03-05, check if valid
    // if there is not a date present, will use today's date instead 
    toEvaluate = _.trim(splittedText[3]);
    if (_.isUndefined(toEvaluate) || _.isEmpty(toEvaluate)) {
      date = moment().format('YYYY-MM-DD');// set for today's date
    } else {
      // check if date is a valid date
      date = _.trim(splittedText[3]);
      if (date.length >= 1 && date.length <= 2) {
        // date has only one component, the "day" of the month.
	const dd = date;
	const yy = moment().year();
	const mm = moment().month();
	date = moment([yy, mm, dd]).format('YYYY-MM-DD');
      } else {
        // Check for date w/format "MM/DD/YYYY"
        let dt = _.split(date, "/");
	if (_.isUndefined(dt) || _.isEmpty(dt) || dt.length === 1) {
          dt = _.split(date, "-");
	  let yy = dt[0];
	  let mm = dt[1]-1;
	  let dd = dt[2];
	  date = moment([yy, mm, dd]).format('YYYY-MM-DD');
	} else {
		let yy = dt[2];
		let mm = dt[0]-1;
		let dd = dt[1]
		date = moment([yy, mm, dd]).format('YYYY-MM-DD');
	}
      }
    }
	  dt = _.split(date, "-");
	  let isValidDate = moment([dt[0], dt[1]-1, dt[2]]).isValid();
	  if (!moment([dt[0], dt[1]-1, dt[2]]).isValid()) {
		  isValid = false;
		  wrongInput += `\n${date}.`;
	  }
  }

    // paid, true if was paid, false is need to be pay
    paid = _.trim(splittedText[4]);
    if (_.isUndefined(paid) || _.isEmpty(paid)) {
	  paid = true;
    } else {
	  paid = (paid === 'true')? true : false;
    }

  return {
    action,
    pronto,
    isValid,
    wrongInput,
	fields: {
	name,
	amount,
	category,
	date,
	paid,
	}
  };
};

module.exports = parse;
