const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const User =
  require("../models/User");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("ลงทะเบียนสมาชิก")

    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("สมาชิก")
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName("ign")
        .setDescription("ชื่อในเกม")
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName("nickname")
        .setDescription("ชื่อเล่น")
        .setRequired(true)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    ),

  async execute(interaction) {

    const user =
      interaction.options.getUser("user");

    const ign =
      interaction.options.getString("ign");

    const nickname =
      interaction.options.getString("nickname");

    const member =
      await interaction.guild.members.fetch(user.id);

    const guildTag =
      `[${process.env.GUILD_TAG}]`;

    const newName =
      `${guildTag} ${ign} ${nickname}`;

    await member.setNickname(newName);

    await member.roles.add(
      process.env.GUILD_ROLE_ID
    );

    await User.findOneAndUpdate(

      {
        discordId: user.id
      },

      {
        discordId: user.id,
        ign,
        nickname,
        discordTag: user.username
      },

      {
        upsert: true
      }

    );

    await interaction.reply(
      `✅ ลงทะเบียน ${newName} สำเร็จ`
    );

  }

};