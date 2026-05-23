require("dotenv").config();

const express = require("express");
const fs = require("fs");

const {
  Client,
  GatewayIntentBits,
  Collection,

  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,

  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  startGuildMonitor
} = require("./guild-monitor");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
client.ctaParticipants = new Map();

/* ---------------- LOAD COMMANDS ---------------- */

const commandFiles = fs
  .readdirSync("./commands")
  .filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

/* ---------------- HELPER ---------------- */

const roleMap = {
  oneshot: "<@&1156442469941121044>",
  alliance: "<@&1418215247667396689>",
  friend: "<@&1418201268014547075>"
};

const SIGNUP_LINK =
"https://docs.google.com/spreadsheets/d/19fwl_SqfWUBh5tw2sKDDpbxDbYd3XW3UV7A7jcw8AJk/edit?usp=sharing";

function convertTime(input) {

  let hour = 0;
  let minute = 0;

  if (input.includes(":")) {
    [hour, minute] = input.split(":");
  }
  else if (input.includes(".")) {
    [hour, minute] = input.split(".");
  }
  else {
    hour = input;
    minute = 0;
  }

  hour = parseInt(hour || 0);
  minute = parseInt(minute || 0);

  const utcHour =
    (hour - 7 + 24) % 24;

  return {
    utc:
`${String(utcHour).padStart(2,"0")}.${String(minute).padStart(2,"0")}`,

    th:
`${String(hour).padStart(2,"0")}.${String(minute).padStart(2,"0")}`
  };
}

function getTodayDate() {

  const now = new Date();

  const d =
String(now.getDate()).padStart(2,"0");

  const m =
String(now.getMonth()+1).padStart(2,"0");

  const y =
String(now.getFullYear())
.slice(-2);

  return `${d}/${m}/${y}`;
}

/* ---------------- INTERACTION ---------------- */

client.on(
"interactionCreate",
async interaction => {

try {

/* ---------- ROLE SELECT ---------- */

if (
interaction.isStringSelectMenu() &&
interaction.customId ===
"cta_role_select"
) {

const roles =
interaction.values;

client.ctaRoles =
client.ctaRoles || {};

client.ctaRoles[
interaction.user.id
] = roles;

const modal =
new ModalBuilder()
.setCustomId("cta_modal")
.setTitle("📢 CTA FORM");

const fields = [

new TextInputBuilder()
.setCustomId("info")
.setLabel("Info")
.setPlaceholder("เช่น : Build HO")
.setStyle(TextInputStyle.Short)
.setRequired(true),

new TextInputBuilder()
.setCustomId("set")
.setLabel("Set")
.setPlaceholder("เช่น : T8 + OC")
.setStyle(TextInputStyle.Short)
.setRequired(true),

new TextInputBuilder()
.setCustomId("massup")
.setLabel("Mass Up Time (TH)")
.setPlaceholder("เช่น : 21:00")
.setStyle(TextInputStyle.Short)
.setRequired(true),

new TextInputBuilder()
.setCustomId("start")
.setLabel("Start Time (TH)")
.setPlaceholder("เช่น : 22:00")
.setStyle(TextInputStyle.Short)
.setRequired(true)

];

modal.addComponents(
...fields.map(f =>
new ActionRowBuilder()
.addComponents(f)
)
);

await interaction.showModal(modal);

return;
}

/* ---------- MODAL SUBMIT ---------- */

if (
interaction.isModalSubmit() &&
interaction.customId ===
"cta_modal"
) {

const info =
interaction.fields.getTextInputValue("info");

const set =
interaction.fields.getTextInputValue("set");

const massup =
interaction.fields.getTextInputValue("massup");

const start =
interaction.fields.getTextInputValue("start");

const m =
convertTime(massup);

const s =
convertTime(start);

const roles =
client.ctaRoles?.[
interaction.user.id
] || [];

const roleTags =
roles.map(r => roleMap[r])
.join(" ");

const content =
`# FULL MASS (${getTodayDate()})

Info : ${info}
Set : ${set}

Mass Up : ${m.utc} UTC ( ${m.th} น. )
Start : ${s.utc} UTC ( ${s.th} น. )

${roleTags}

👥 Participants (0)`;

const buttons =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("join_cta")
.setLabel("Join CTA")
.setEmoji("✅")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("leave_cta")
.setLabel("Leave CTA")
.setEmoji("❌")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setLabel("Signup Sheet")
.setEmoji("📋")
.setStyle(ButtonStyle.Link)
.setURL(SIGNUP_LINK)
);

const channel =
await client.channels.fetch(
process.env.CTA_CHANNEL_ID
);

const msg =
await channel.send({
content,
components:[buttons]
});

global.lastCTAMessage = msg;

client.ctaParticipants.set(
msg.id,
[]
);

/* ---------- REMINDER ---------- */

const reminderChannel =
await client.channels.fetch(
process.env.REMINDER_CHANNEL_ID
);

setTimeout(() => {

reminderChannel.send(
`🚨 CTA Reminder

FULL MASS starts in 1 hour

${roleTags}`
);

},
1000 * 60 * 60);

setTimeout(() => {

reminderChannel.send(
`⚠️ MASS UP NOW

${roleTags}`
);

},
1000 * 60 * 10);

await interaction.reply({
content:"✅ CTA Created",
ephemeral:true
});

return;
}

/* ---------- BUTTON ---------- */

if (
interaction.isButton()
) {

const msgId =
interaction.message.id;

const users =
client.ctaParticipants.get(msgId);

if (!users) return;

if (
interaction.customId ===
"join_cta"
) {

if (
!users.includes(
interaction.user.id
)
) {
users.push(
interaction.user.id
);
}

}

if (
interaction.customId ===
"leave_cta"
) {

const index =
users.indexOf(
interaction.user.id
);

if (index > -1)
users.splice(index,1);
}

let content =
interaction.message.content;

content =
content.replace(
/👥 Participants \(\d+\)/,
`👥 Participants (${users.length})`
);

await interaction.update({
content
});

return;
}

/* ---------- COMMAND ---------- */

if (
!interaction.isChatInputCommand()
) return;

const command =
client.commands.get(
interaction.commandName
);

if (!command) return;

await command.execute(
interaction
);

}
catch(err){

console.error(err);

try {

if (
interaction.deferred ||
interaction.replied
){

await interaction.followUp({
content:"❌ Error",
flags:64
});

}
else{

await interaction.reply({
content:"❌ Error",
flags:64
});

}

} catch(e){

console.log(
"⚠️ Cannot reply interaction"
);

}

}

/* ---------------- READY ---------------- */

client.once("clientReady", () => {

console.log(
`✅ Logged in as ${client.user.tag}`
);

startGuildMonitor(client);

}
);

/* ---------------- LOGIN ---------------- */

client.login(
process.env.TOKEN
);

/* ---------------- EXPRESS ---------------- */

const app = express();

app.get(
"/",
(req,res)=>
res.send("Bot Running")
);

app.listen(3000);