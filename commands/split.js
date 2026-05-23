const { SlashCommandBuilder } = require("discord.js");

function parseNumber(input) {
  if (!input) return 0;

  input = input.toLowerCase();

  // 🔥 รองรับ 200k / 1.5k
  if (input.includes("k")) {
    return Math.floor(parseFloat(input.replace("k", "")) * 1000);
  }

  // 🔥 ลบ comma
  return parseInt(input.replace(/,/g, ""));
}

function formatNumber(num) {
  return num.toLocaleString("en-US");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("split")
    .setDescription("💰 Loot Split Calculator")

    .addStringOption(o =>
      o.setName("total")
        .setDescription("เงินรวม (เช่น 200k หรือ 200,000)")
        .setRequired(true)
    )

    .addIntegerOption(o =>
      o.setName("players")
        .setDescription("จำนวนคน")
        .setRequired(true)
    ),

  async execute(interaction) {

    const totalRaw = interaction.options.getString("total");
    const players = interaction.options.getInteger("players");

    const total = parseNumber(totalRaw);
    const each = Math.floor(total / players);

    await interaction.reply(
`💰 LOOT SPLIT

Total: ${formatNumber(total)}
Players: ${players}
Each player: ${formatNumber(each)}`
    );
  }
};