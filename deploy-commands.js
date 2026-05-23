require("dotenv").config();

const fs = require("fs");
const { REST, Routes } = require("discord.js");

const commands = [];

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  console.log("Loading:", file);

  const command = require(`./commands/${file}`);

  // 🔥 กันพังทุกไฟล์
  if (!command?.data?.name) {
    console.log("❌ Missing name:", file);
    process.exit(1);
  }

  if (!command?.data?.description) {
    console.log("❌ Missing description:", file);
    process.exit(1);
  }

  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {

    console.log("🚀 Deploying commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Deploy success!");
    console.log("📦 Total:", commands.length);

  } catch (err) {
    console.error("❌ Deploy failed:");
    console.error(err);
  }
})();