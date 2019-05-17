'use strict';

const aws = require('aws-sdk');
const lambda = new aws.Lambda();
const botBuilder = require('claudia-bot-builder');

const slackDelayedReply = botBuilder.slackDelayedReply;
const Parse = require('./helpers/parse');
const Spending = require('./controllers/spending');

const api = botBuilder((message, apiRequest) => {
  // Parse the text:
  // action - (string) what the user is asking
  // isValidAction - (bool) if `action` was on the list is true.
  // pronto - (string) The first answer to Slack
  // bill - (string) the transaction name if exists
  // category - (string) the type of transaction if exists
  // amount - (number) the amount paid or to pay for the transaction
  // paid - (bool) indicate if the bill was paid or need to be pay
  const {
    action, isValid, wrongInput, pronto, fields,
  } = Parse(message.text);

  if (isValid) {
    if (action === 'HELP') {
      return pronto;
    }
    return new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: apiRequest.lambdaContext.functionName,
        Qualifier: apiRequest.lambdaContext.functionVersion,
        InvocationType: 'Event',
        Payload: JSON.stringify({
          slackEvent: {
            message, // will enable us to detect the event later and filter it
            action,
            isValid,
            wrongInput,
            fields,
          },
        }),
      }, (err, done) => {
        if (err) return reject(err);
        resolve(done);
      });
    }).then(() => ({// the initial response
      text: `*${pronto}*`,
      response_type: 'in_channel',
    })).catch(err => `${err.message}`);
  }
  return 'Wow. I missed that. Valid commands are: `add`, `last`, `balance`, `projected`, and `help`';
});


api.intercept((event) => {
  if (!event.slackEvent) { // if this is a normal web request, let it run
    return event;
  }

  // get the parse values from previous call
  const {
    message, action, wrongInput, fields,
  } = event.slackEvent;

  return new Promise((resolve, reject) => {

    // respText holds the answer to the request
    // values holds the fields to query the database
    let respText; let values;

    // Filter what request will fire accordingly to the "action" value
    switch (action) {

      // Add a new transaction to the "Spending" table
      case 'ADD':
	values = {
	  table: 'Spending',
	  fields,
	};
	
        Spending.add(values).then(
	  result => resolve(result), 
	  err => reject(err)
	);
	break;

      case 'LAST':
        Spending.last().then(
	  result => resolve(result),
	  err => reject(err)
	);
	break;

      case 'UNPAID':
      case 'TOPAY':
        Spending.toPaid().then(
	  result => resolve(result),
	  err => reject(err)
	);
	break;

      case 'DISCRETIONARY':
      case 'DIS':
        Spending.discretionary().then(
	  result => resolve(result),
	  err => reject(err)
	);
	break;
     
      case 'COMMITTED':
      case 'COM':
	Spending.committed().then(
	  result => resolve(result),
	  err => reject(err)
	);
	break;

      case 'FINANCIAL':
      case 'FIN':
	Spending.financial().then(
	  result => resolve(result),
	  err => reject(err)
	);
	break;



      default:
	respText = 'Something when really wrong!!!. Try again ;)';
	resolve(respText);
	break;
    }


  }).then(respText => {
      // TODO: this might work, return responses(respText)
      return slackDelayedReply(message, {
	text: respText,
	response_type: "in_channel"
      });
    }).then(() => false)
    .catch(respText => {
      return slackDelayedReply(message, {
	text: respText,
	response_type: "in_channel"
      });
    }); // end of `new Promise`

    const responses = respText => { return slackDelayedReply(message, { text: respText, response_type: "in_channel" }) };
});


module.exports = api;
