const { REST, Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("💣 Force resetting commands...");

    // ล้าง guild commands
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: [] }
    );

    // ล้าง global commands (สำคัญมาก)
    await rest.put(
      Routes.applicationCommands(
        process.env.CLIENT_ID
      ),
      { body: [] }
    );

    console.log("✅ ALL COMMANDS CLEARED (guild + global)");
  } catch (err) {
    console.error(err);
  }
})();