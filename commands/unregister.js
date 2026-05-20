const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const User =
  require("../models/User");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("ลบสมาชิกออกจากระบบ")

    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("สมาชิก")
        .setRequired(true)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    ),

  async execute(interaction) {

    const user =
      interaction.options.getUser("user");

    const member =
      await interaction.guild.members.fetch(user.id);

    await member.roles.remove(
      process.env.GUILD_ROLE_ID
    );

    await member.setNickname(null);

    await User.findOneAndDelete({
      discordId: user.id
    });

    await interaction.reply(
      `✅ ลบ ${user.username} ออกจากระบบแล้ว`
    );

  }

};
