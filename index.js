require("dotenv").config();

const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");

const {
  Client,
  Collection,
  GatewayIntentBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(`./commands/${file}`);

  client.commands.set(command.data.name, command);

}

client.once("clientReady", async () => {

  console.log(`✅ บอทออนไลน์ ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "Albion Online"
      }
    ],
    status: "online"
  });

});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const command =
    client.commands.get(interaction.commandName);

  if (!command) return;

  try {

    await command.execute(interaction);

  } catch (error) {

    console.error(error);

    if (interaction.replied || interaction.deferred) {

      await interaction.followUp({
        content: "❌ มีข้อผิดพลาด",
        ephemeral: true
      });

    } else {

      await interaction.reply({
        content: "❌ มีข้อผิดพลาด",
        ephemeral: true
      });

    }

  }

});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {

    console.log("✅ MongoDB Connected");

  })
  .catch((error) => {

    console.log("❌ MongoDB Error");
    console.log(error);

  });

const app = express();

app.get("/", (req, res) => {

  res.send("Bot online!");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`🌐 Web server running on port ${PORT}`);

});

client.login(process.env.TOKEN);