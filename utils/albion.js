const axios = require("axios");

async function isInGuild(playerName, guildName) {

  try {

    const res = await axios.get(
      `https://gameinfo.albiononline.com/api/gameinfo/search?q=${playerName}`
    );

    const players = res.data.players || [];

    const found = players.find(p =>
      p.Name.toLowerCase() === playerName.toLowerCase()
    );

    if (!found) return "NOT_FOUND";

    if (!found.GuildName) return false;

    return found.GuildName === guildName;

  } catch (err) {
    return "ERROR";
  }
}

module.exports = { isInGuild };