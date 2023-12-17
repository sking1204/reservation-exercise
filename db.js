/** Database for lunchly */

const { Client } = require("pg");
const client = new Client({
  host: "/var/run/postgresql/",
  database: "lunchly",
});
client.connect();

module.exports = client;


/* SB setup */

// const pg = require("pg");

// const db = new pg.Client("postgresql:///lunchly");

// db.connect();

// module.exports = db;
