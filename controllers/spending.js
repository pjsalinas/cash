const _ = require('lodash');

const db = require('../models/store');

const queries = {

   /**
   * Add a new spending entry
   * values (obj) hold the info to be recorded on the base
   * values = { table: "Spending", fields: { name: "EntryName", amount: "$ amount", category: "discretionary", date: "2019-04-01", paid: true } }
   */
  add: (values) => {
    return new Promise((resolve, reject) => {
      db.create(values).then(
	record => resolve(`> Added *${record.get('name')}* to CASH.`), 
	err => reject(err.message)
      );
    });
  },

  select: (values) => {
    return new Promise((resolve, reject) => {
      db.select(values).then(
	records => {},
	err => reject(err.message)
      );
    });
  },

  /**
   * Get the last 10 transactions
   */
  last: () => {
    return new Promise((resolve, reject) => {
      let values = {
	table: "Spending",
	fields: {
	  view: "Main View",
	  maxRecords: 10,
	  sort: [
	    {"field": "date", "direction":"desc"}
	  ],
	  filterByFormula: '{paid}=1'
	}
      };
      
      db.select(values).then(
	records => {
	  let respText = '';
	  if(records.length > 0) {
            _.each(records, record => {
	      let cat = record.get('category').substr(0,3);
	      respText += `\`${record.get('handler')}\` _*${cat}*_ ${record.get('name')} *${record.get('amount')}*\n`;
	    });
	    resolve(respText);
	  } else {
	    respText = `We could not find any entries. Be wise my friend`;
	  }
	  resolve(respText);
	},
	err => reject(err.message)
      );
    });
  }, // end of "last"


  /**
   * Get `Unpaid` transactions
   */
  toPaid: () => {
    return new Promise((resolve, reject) => {
      let values = {
	table: "Spending",
	fields: {
	  view: "To Pay",
	}
      };

      db.select(values).then(
	records => {
	  let respText;
	  if(records.length > 0) {
	    respText = `Found *${records.length}* entries\n`;
            _.each(records, record => {
	      let cat = record.get('category').substr(0,3);
	      respText += `\`${record.get('handler')}\` _*${cat}*_ ${record.get('name')} *${record.get('amount')}*\n`;
	    });
	  } else {
	    respText = `Still wise my friend`;
	  }
	  resolve(respText);
	},
	err => reject(err.message)
      );
    });
  }, // end of "unpaid"

  /*
   * Retrieve all the entries whose category match "DISCRETIONARY"
   */
  discretionary: () => {
    return new Promise((resolve, reject) => {
      let values = {
	table: "Spending",
	fields: {
	  view: "Discretionary"
	}
      };

      db.select(values).then(
	records => {
          if(records.length > 0) {
	    let totals = 0.0;
	    let respText = `Found *${records.length}* entries\n`;
	    _.each(records, record => {
	      respText += `\`${record.get('handler')}\` ${record.get('name')} *${record.get('amount')}*\n`;
	      totals += record.get('amount') * 1;
	    });
	    respText += `Total *\$${totals}*`;
	  } else {
	    respText = 'Not *Discretionary* records found';
	  }
	  resolve(respText);
	},
	err => reject(err.message)
      );
    });
  },

  committed: () => {
    return new Promise((resolve, reject) => {
      let values = {
	table: "Spending",
	fields: {
	  view: "Committed"
	}
      };

      db.select(values).then(
	records => {
          if(records.length > 0) {
	    let respText = `Found *${records.length}* entries\n`;
	    _.each(records, record => {
	      respText += `\`${record.get('handler')}\` ${record.get('name')} *${record.get('amount')}*\n`;
	    });
	  } else {
	    respText = 'Not *Committed* records found';
	  }
	  resolve(respText);
	},
	err => reject(err.message)
      );
    });
  },


  financial: () => {
    return new Promise((resolve, reject) => {
      let values = {
	table: "Spending",
	fields: {
	  view: "Financial"
	}
      };

      db.select(values).then(
	records => {
          if(records.length > 0) {
	    let respText = `Found *${records.length}* entries\n`;
	    _.each(records, record => {
	      respText += `\`${record.get('handler')}\` ${record.get('name')} *${record.get('amount')}*\n`;
	    });
	  } else {
	    respText = 'Not *Financial* records found';
	  }
	  resolve(respText);
	},
	err => reject(err.message)
      );
    });
  },

};

module.exports = queries;
