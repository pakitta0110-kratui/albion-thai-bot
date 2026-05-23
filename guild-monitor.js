const axios = require("axios");

/* ================= CONFIG ================= */

const CHECK_INTERVAL = 1 * 60 * 1000; // 🔥 เช็คทุก 1 นาที
const API_TIMEOUT = 10000;
const RETRY_DELAY = 3000;

let previousMembers = new Set();
let firstLoad = true;

/* ================= SAFE FETCH ================= */

async function fetchGuildMembers(retry = true) {

  try {

    const response = await axios.get(

      `https://gameinfo.albiononline.com/api/gameinfo/guilds/${process.env.GUILD_ID}/members`,

      {
        timeout: API_TIMEOUT
      }

    );

    return response.data || [];

  } catch (error) {

    console.log("⚠️ Albion API timeout / error");

    /* ---------- RETRY ---------- */

    if (retry) {

      console.log("🔄 Retrying Albion API...");

      await new Promise(resolve =>
        setTimeout(resolve, RETRY_DELAY)
      );

      return fetchGuildMembers(false);

    }

    console.log("❌ Albion API failed (skip cycle)");

    return null;

  }

}

/* ================= TIME ================= */

function getTimeData() {

  const now = new Date();

  return {

    date: now.toLocaleDateString("en-GB"),

    utcTime: now.toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit"
    }),

    thTime: now.toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit"
    })

  };

}

/* ================= MONITOR ================= */

function startGuildMonitor(client) {

  console.log("🏰 Guild Monitor Started");

  setInterval(async () => {

    try {

      /* ---------- FETCH ---------- */

      const members =
        await fetchGuildMembers();

      if (!members) return;

      console.log(
        `👥 Current members: ${members.length}`
      );

      /* ---------- CHANNEL ---------- */

      const channel =
        await client.channels.fetch(
          process.env.LOG_CHANNEL_ID
        );

      if (!channel) {

        console.log(
          "❌ LOG_CHANNEL_ID not found"
        );

        return;

      }

      /* ---------- CURRENT SET ---------- */

      const currentSet =
        new Set(
          members.map(m => m.Name)
        );

      /* ---------- FIRST LOAD ---------- */

      if (firstLoad) {

        previousMembers = currentSet;

        firstLoad = false;

        console.log(
          `✅ Loaded ${currentSet.size} guild members`
        );

        return;

      }

      /* ---------- TIME ---------- */

      const {
        date,
        utcTime,
        thTime
      } = getTimeData();

      console.log("🔍 Checking joins...");
      console.log("🔍 Checking leaves...");

      /* ================= JOIN ================= */

      for (const member of members) {

        if (!previousMembers.has(member.Name)) {

          console.log(
            `🟢 JOIN DETECTED: ${member.Name}`
          );

          await channel.send(

`## 🟢 MEMBER JOINED

👤 Player : ${member.Name}
🏰 Guild : ${process.env.GUILD_NAME}

📅 Date : ${date}
🕒 Time : ${utcTime} UTC (${thTime} น.)`

          );

        }

      }

      /* ================= LEAVE ================= */

      for (const oldMember of previousMembers) {

        if (!currentSet.has(oldMember)) {

          console.log(
            `🔴 LEAVE DETECTED: ${oldMember}`
          );

          await channel.send(

`## 🔴 MEMBER LEFT

👤 Player : ${oldMember}
🏰 Guild : ${process.env.GUILD_NAME}

📅 Date : ${date}
🕒 Time : ${utcTime} UTC (${thTime} น.)`

          );

        }

      }

      /* ---------- SAVE ---------- */

      previousMembers = currentSet;

      console.log("✅ Monitor cycle completed");

    } catch (error) {

      console.log(
        "❌ Guild Monitor Error:",
        error.message
      );

    }

  }, CHECK_INTERVAL);

}

module.exports = {
  startGuildMonitor
};