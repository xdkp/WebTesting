const { Pool } = require("pg");

const pool = new Pool({
	user: "ctfuser",
	host: "db",
	database: "ctfdb",
	password: "ctfpass",
	port: 5432,
});

module.exports = pool;
