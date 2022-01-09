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
// const {
//   autoresponse
// } = require("./utils/autoresponse/autoresponse");
// const {
//   blacklist
// } = require("./utils/blacklist/blacklist");
const defaultCooldown = new Set();
const settingsCooldown = new Set();

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"]
});
bot.setMaxListeners(50);

const database = new Database();

const whitelist = require('./whitelist.json');

bot.on('guildCreate', async (guild) => {
  let gid = guild.id;
  console.log(whitelist.server.indexOf(gid))
  if(whitelist.server.indexOf(gid) === -1) return guild.leave();

  await database.query(`SELECT guild_id FROM all_guild_id WHERE guild_id = ?`, [guild.id]).then(async res => {
    if(res.length <= 0) await database.query(`INSERT INTO all_guild_id (guild_id) VALUES (?)`, [guild.id]).catch(err => {})
  });
  await database.query(`CREATE TABLE ${guild.id}_config LIKE _config_template`).then(async () => {
    await database.query(`INSERT INTO ${guild.id}_config (guild_id) VALUES (?)`, [guild.id]).catch(err => {})
  }).catch(err => {});
  await database.query(`CREATE TABLE ${guild.id}_guild_logs LIKE _guild_logs_template`).catch(err => {});
  await database.query(`CREATE TABLE ${guild.id}_guild_modroles LIKE _guild_modroles_template`).catch(err => {})
  await database.query(`CREATE TABLE ${guild.id}_guild_joinroles LIKE _guild_joinroles_template`).catch(err => {})
  await database.query(`CREATE TABLE ${guild.id}_guild_warnroles LIKE _guild_warnroles_template`).catch(err => {})
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
  database.query(`SELECT welcome_channel FROM ${member.guild.id}_config`).then(res => {
    if (res[0].welcome_channel !== null) {
      bot.channels.cache.find(c => c.id === res[0].welcome_channel).send('Welcome ' + member.user.username)
    }
  }).catch(err => console.log(err))

  database.query(`SELECT * FROM ${member.guild.id}_guild_joinroles`).then(res => {
    for (i in res) {
      let role = member.guild.roles.cache.find(r => r.id === res[i].role_id);
      //setTimeout(function () {
      try {
        member.roles.add(role);
      } catch (err) {
        //NO PERMISSONS
      }
      // }, 10000);
    }

  }).catch(err => console.log(err))
});

//Command Manager
bot.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  // blacklist(1, message);
  // autoresponse(message);

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  var prefix;
  database.query(`SELECT prefix FROM ${message.guild.id}_config`).then(async res => {
    prefix = await res;

    if (cmd.startsWith(prefix[0].prefix)) {

      let commandfile = bot.commands.get(cmd.slice(prefix[0].prefix.length));
      if (commandfile) { //&& blacklist(0, message)
        database.query(`SELECT cooldown FROM ${message.guild.id}_config`).then(res => {
          if(settingsCooldown.has(message.author.id) && cmd === `${prefix[0].prefix}settings`) return message.channel.send(`You have to wait ${config.defaultSettingsCooldown.text} after each Settings Command.`);
          else {
            settingsCooldown.add(message.author.id);
            setTimeout(async () => {
              settingsCooldown.delete(message.author.id);
            }, config.defaultSettingsCooldown.format);
          }

          if (defaultCooldown.has(message.author.id)) {
            return message.channel.send(`You have to wait ${res[0].cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`);
          } else {
            defaultCooldown.add(message.author.id);
            commandfile.run(bot, message, args);

            setTimeout(async () => {
              defaultCooldown.delete(message.author.id);
            }, res[0].cooldown || config.defaultCooldown.format);

          }
        });
      }
    }
  }).catch(err => console.log(err));
});

bot.once('ready', () => {
  checkInfractions(bot);
  checkTemproles(bot)
  auditLog(bot);

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server****`);
  bot.user.setActivity({
    name: "https://github.com/Mittelbots/",
    type: 'PLAYING'
  });
});

const token = require('./_secret/token.json');
bot.login(token.BOT_TOKEN);