const express = require("express");
require("dotenv").config();

const fs = require("fs");

const {
  Client,
  Collection,
  GatewayIntentBits
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(`./commands/${file}`);

  client.commands.set(command.data.name, command);

}

client.once("clientReady", () => {

  console.log(`✅ ออนไลน์ ${client.user.tag}`);

});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {

    await command.execute(interaction);

  } catch (error) {

    console.error(error);

    await interaction.reply({
      content: "❌ มีข้อผิดพลาด",
      ephemeral: true
    });

  }

});

const app = express();

app.get("/", (req, res) => {
  res.send("Bot online!");
});

app.listen(3000, () => {
  console.log("🌐 Web server running");
});

client.login(process.env.TOKEN);