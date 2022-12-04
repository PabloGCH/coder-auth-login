const path = require("path");
const sqliteconfig = {
	client: "sqlite",
	connection: {
		filename: path.join(__dirname, "../db/messagesDb.sqlite")
	}
}

module.exports = sqliteconfig;
