const mongoose = require("mongoose");

const userCollection = "users";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
})

const UserModel = mongoose.model(userCollection, userSchema);


module.exports = UserModel
