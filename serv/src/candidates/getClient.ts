const { Client } = require('pg');
require('dotenv').config();

module.exports.getClient = async () => {
  
  let cuttedHost = process.env.DB_HOST?.substring(0, process.env.DB_HOST?.indexOf(":"));
  
  const client = new Client({
    host: cuttedHost,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

  });
  await client.connect();
  return client;
};