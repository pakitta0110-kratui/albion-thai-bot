const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("small-cancel")

    .setDescription("ยกเลิก Small Scale ล่าสุด")

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {

    if (!global.lastSmallMessage) {

      return interaction.reply({

        content: "❌ ไม่มี Small Scale ล่าสุด",

        flags: 64

      });

    }

    try {

      const msg =
        global.lastSmallMessage;

      await msg.edit({

        content:
`${msg.content}

# ❌ SMALL SCALE CANCELLED`,

        components: []

      });

      global.lastSmallMessage = null;

      interaction.client.ctaParticipants.clear();

      await interaction.reply({

        content:
"✅ Small Scale Cancelled",

        flags: 64

      });

    } catch (err) {

      console.error(err);

      await interaction.reply({

        content:
"❌ ยกเลิก Small Scale ไม่สำเร็จ",

        flags: 64

      });

    }

  }

};