const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("cta-cancel")

    .setDescription("ยกเลิก CTA ล่าสุด")

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {

    if (!global.lastCTAMessage) {

      return interaction.reply({

        content: "❌ ไม่มี CTA ล่าสุด",

        flags: 64

      });

    }

    try {

      const msg =
        global.lastCTAMessage;

      await msg.edit({

        content:
`${msg.content}

# ❌ CTA CANCELLED`,

        components: []

      });

      global.lastCTAMessage = null;

      interaction.client.ctaParticipants.clear();

      await interaction.reply({

        content:
"✅ CTA Cancelled",

        flags: 64

      });

    } catch (err) {

      console.error(err);

      await interaction.reply({

        content:
"❌ ยกเลิก CTA ไม่สำเร็จ",

        flags: 64

      });

    }

  }

};