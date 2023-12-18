const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String, // Make sure this line is present
  password: String,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
