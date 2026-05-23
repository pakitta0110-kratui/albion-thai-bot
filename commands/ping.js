const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Check bot latency"),

  async execute(interaction) {

    try {
      const sent = await interaction.reply({
        content: "🏓 Pong!",
        fetchReply: true
      });

      const latency = sent.createdTimestamp - interaction.createdTimestamp;

      await interaction.editReply(
        `🏓 Pong!\n⚡ Latency: ${latency}ms`
      );

    } catch (err) {
      console.error("Ping Error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Ping error",
          ephemeral: true
        });
      }
    }
  }
};