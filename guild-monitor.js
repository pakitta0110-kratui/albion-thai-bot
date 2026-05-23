const axios = require("axios");

/* ================= CONFIG ================= */

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 นาที
const API_TIMEOUT = 10000; // 10 วิ
const RETRY_DELAY = 3000; // 3 วิ

let previousMembers = new Set();
let firstLoad = true;

/* ================= SAFE API FETCH ================= */

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

    /* ---------- RETRY 1 รอบ ---------- */

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

/* ================= TIME FORMAT ================= */

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

/* ================= MONITOR SYSTEM ================= */

function startGuildMonitor(client) {

  console.log("🏰 Guild Monitor Started");

  setInterval(async () => {

    try {

      /* ---------- FETCH MEMBERS ---------- */

      const members =
        await fetchGuildMembers();

      if (!members) return;

      /* ---------- CHANNEL ---------- */

      const channel =
        await client.channels.fetch(
          process.env.LOG_CHANNEL_ID
        );

      if (!channel) {

        console.log("❌ LOG_CHANNEL_ID not found");

        return;

      }

      /* ---------- CURRENT MEMBER SET ---------- */

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

      /* ================= JOIN ================= */

      for (const member of members) {

        if (!previousMembers.has(member.Name)) {

          await channel.send(

`## 🟢 MEMBER JOINED

👤 Player : ${member.Name}
🏰 Guild : ${process.env.GUILD_NAME}

📅 Date : ${date}
🕒 Time : ${utcTime} UTC (${thTime} น.)`

          );

          console.log(
            `🟢 JOIN: ${member.Name}`
          );

        }

      }

      /* ================= LEAVE ================= */

      for (const oldMember of previousMembers) {

        if (!currentSet.has(oldMember)) {

          await channel.send(

`## 🔴 MEMBER LEFT

👤 Player : ${oldMember}
🏰 Guild : ${process.env.GUILD_NAME}

📅 Date : ${date}
🕒 Time : ${utcTime} UTC (${thTime} น.)`

          );

          console.log(
            `🔴 LEFT: ${oldMember}`
          );

        }

      }

      /* ---------- SAVE ---------- */

      previousMembers = currentSet;

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