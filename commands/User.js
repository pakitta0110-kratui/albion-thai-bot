const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  discordId: String,
  ign: String,
  nickname: String,
  discordTag: String

});

module.exports =
  mongoose.model("User", userSchema);
