const express = require("express");
const router = express.Router();
const resetAndInitializeDb = require("./../initdb");

router.get("/reset-db", async (req, res) => {
	try {
		await resetAndInitializeDb();
		res.send("Database reset and initialized successfully.");
	} catch (error) {
		res.status(500).send("Error resetting database.");
	}
});

module.exports = router;
