const {
  SlashCommandBuilder
} = require("discord.js");

const User =
  require("../models/User");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("registered")
    .setDescription("ดูรายชื่อสมาชิกที่ลงทะเบียน"),

  async execute(interaction) {

    const users =
      await User.find();

    if (users.length === 0) {

      return interaction.reply(
        ":x: ยังไม่มีสมาชิก"
      );

    }

    let text =
      `Registered Users (${users.length})\n\n`;

    for (const user of users) {

      text +=
        `• <@${user.discordId}> : ${user.ign} (${user.nickname})\n`;

    }

    interaction.reply(text);

  }

};