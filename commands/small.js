const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("small")
    .setDescription("Create Small Scale CTA"),

  async execute(interaction) {

    const select = new StringSelectMenuBuilder()
      .setCustomId("small_role_select")
      .setPlaceholder("เลือก Role Tag")
      .setMinValues(1)
      .setMaxValues(3)
      .addOptions([
        {
          label: "One Shot",
          value: "oneshot",
          emoji: "🏰"
        },
        {
          label: "Alliance",
          value: "alliance",
          emoji: "⚔️"
        },
        {
          label: "Friend",
          value: "friend",
          emoji: "🤝"
        }
      ]);

    const row =
      new ActionRowBuilder()
        .addComponents(select);

    await interaction.reply({
      content: "📢 เลือก Role ที่ต้องการ Tag",
      components: [row],
      flags: 64
    });

  }
};