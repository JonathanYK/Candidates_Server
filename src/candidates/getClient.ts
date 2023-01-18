const { Client } = require('pg');
require('dotenv').config();

module.exports.getClient = async () => {
  const client = new Client({

    //TODO: encript
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'postgres',
    database: 'apitests',
  });
  await client.connect();
  return client;
};