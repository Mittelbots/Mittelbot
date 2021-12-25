const Discord = require("discord.js");
const fs = require('fs');
const config = require('./config.json');
const {
  Database
} = require("./src/db/db");
const {
  checkInfractions
} = require("./src/events/checkInfraction");
const {
  checkTemproles
} = require("./src/events/checkTemproles");
const {
  auditLog
} = require("./utils/auditlog/auditlog");
const {
  autoresponse
} = require("./utils/autoresponse/autoresponse");
const {
  blacklist
} = require("./utils/blacklist/blacklist");
const defaultCooldown = new Set();

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"]
});
bot.setMaxListeners(50);

const database = new Database();

bot.on('guildCreate', guild => {

  database.query(`CREATE TABLE ${guild.id}_config LIKE _guild_config_template`).then(() => {
    database.query(`INSERT INTO ${guild.id}_config (guild_id) VALUES (?)`, [guild.id]).catch(err => {})
  }).catch(err => {});
  database.query(`CREATE TABLE ${guild.id}_guild_logs LIKE _guild_logs_template`).catch(err => {});
  database.query(`CREATE TABLE ${guild.id}_guild_modroles LIKE _guild_modroles_template`).catch(err => {})
});

bot.commands = new Discord.Collection();

let modules = fs.readdirSync('./src/commands/');
modules.forEach((module) => {
  fs.readdir(`./src/commands/${module}`, (err, files) => {
    if (err) {
      console.log(`Mission Folder!!`, err);
    }
    files.forEach((file) => {
      if (!file.endsWith('.js')) return;
      let command = require(`./src/commands/${module}/${file}`);
      console.log(`${command.help.name} Command has been loaded!`);
      if (command.help.name) bot.commands.set(command.help.name, command)

    })
  });
});

//When a member join add a role called Member to them and welcome them in a channel welcome
bot.on('guildMemberAdd', member => {
  database.query(`SELECT welcome_channel, member_role FROM ${member.guild.id}_config`).then(res => {
    if (res !== '') {
      bot.channels.cache.find(c => c.id === res[0].welcome_channel).send('Welcome ' + member.user.username)

      let role = member.guild.roles.cache.find(r => r.id === res[0].member_role);

      //setTimeout(function () {
      member.roles.add(role);
      // }, 10000);
    }
  }).catch(err => console.log(err))
});

//Command Manager
bot.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  auditLog(bot, message.guild.id);
  blacklist(1, message);
  autoresponse(message);

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  var prefix;
  database.query(`SELECT prefix FROM ${message.guild.id}_config`).then(async res => {
    prefix = await res;

    if (cmd.startsWith(prefix.prefix)) {
      let commandfile = bot.commands.get(cmd.slice(prefix.length));
      if (commandfile && blacklist(0, message)) {
        if (defaultCooldown.has(message.author.id)) {
          return message.channel.send(`Wait ${config.defaultCooldown.text} before getting typing this again.`);
        } else {
          defaultCooldown.add(message.author.id);
          commandfile.run(bot, message, args);
          setTimeout(async () => {
            defaultCooldown.delete(message.author.id);
          }, config.defaultCooldown.format);
        }
      }
    }
  }).catch(err => console.log(err));
});

bot.once('ready', () => {
  checkInfractions(bot);
  checkTemproles(bot)

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server****`);
  bot.user.setActivity({
    name: "Dev Bot for Chilled Sad",
    type: 'PLAYING'
  })
});

const token = require('./_secret/token.json');
bot.login(token.BOT_TOKEN);