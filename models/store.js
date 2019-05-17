'use strict';

const Airtable = require('airtable'); 

const base = new Airtable({
	apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_CASH);


const db = {
	select: (values) => {
		let {table, fields} = values;
		return new Promise((resolve, reject) => {
			base(table).select(fields).firstPage((err, data) => {
				(err)? reject(err) : resolve(data);
			});
		});
	},

	create: (values) => {
		let {table, fields} = values;
		return new Promise((resolve, reject) => {
			base(table).create(fields, (err, data) => {
				(err)? reject(err) : resolve(data);
			});
		});
	},

	destroy: (values) => {
		let {table, Id} = values;
		return new Promise((resolve, reject) => {
			base(table).destroy(Id, (err, data) => {
				(err)? reject(err) : resolve(data);
			});
		});
	},
};

module.exports = db;
