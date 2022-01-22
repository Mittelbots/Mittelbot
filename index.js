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
const { gainXP } = require("./src/events/levelsystem/levelsystem");

const { log } = require('./logs');
// const {
//   autoresponse
// } = require("./utils/autoresponse/autoresponse");
// const {
//   blacklist
// } = require("./utils/blacklist/blacklist");

const { giveAllRoles } = require("./utils/functions/roles/giveAllRoles");
const { getAllRoles } = require("./utils/functions/roles/getAllRoles");

const defaultCooldown = new Set();
const settingsCooldown = new Set();
const levelCooldown = new Set();

const lvlconfig = require('./src/assets/json/levelsystem/levelsystem.json');

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"]
});
bot.setMaxListeners(0);

const database = new Database();

const whitelist = require('./whitelist.json');

const { guildCreate } = require("./src/events/guildCreate/guildCreate");

bot.on('guildCreate', async (guild) => await guildCreate(database, guild, whitelist, log));

bot.commands = new Discord.Collection();

let modules = fs.readdirSync('./src/commands/');
modules.forEach((module) => {
  fs.readdir(`./src/commands/${module}`, (err, files) => {
    if (err) {
      log.warn('Missing folder!', err)
      if(config.debug == 'true') console.log(`Mission Folder!!`, err);
    }
    files.forEach((file) => {
      if (!file.endsWith('.js')) return;
      let command = require(`./src/commands/${module}/${file}`);
      console.log(`${command.help.name} Command has been loaded!`);
      if (command.help.name) bot.commands.set(command.help.name, command)

    })
  });
});

bot.on('guildMemberAdd', member => {
  database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
    if(await res.length == 0) {
      database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, user_joined) VALUES (?, ?)`, [member.user.id, new Date()]).catch(err => {log.fatal(err)});
    }else {
      await database.query(`SELECT * FROM open_infractions WHERE user_id = ?`, [member.user.id]).then(async inf => {
        if(await inf.length != 0) {
          member.roles.add([member.guild.roles.cache.find(r => r.name === 'Muted')]);
        }else {
          let user_roles = await res[0].member_roles;
          user_roles = JSON.parse(user_roles);

          //? IF MUTED ROLE IS IN USERS DATASET -> MUTED ROLE WILL BE REMOVED
          if(user_roles !== null && user_roles.indexOf(member.roles.cache.find(r => r.name === 'Muted')) !== -1) user_roles = user_roles.filter(val => {return val !== member.roles.cache.find(r => r.name === 'Muted').id});

          await giveAllRoles(member, member.guild, user_roles, bot);
        }
      }).catch(err => {
        log.fatal(err)
      });
    }
    return;
  }).catch(err => log.fatal(err));

  database.query(`SELECT welcome_channel FROM ${member.guild.id}_config`).then(res => {
    if (res[0].welcome_channel !== null) {
      bot.channels.cache.find(c => c.id === res[0].welcome_channel).send('Welcome ' + member.user.username)
    }
  }).catch(err => { 
    log.fatal(err);
    if(config.debug == 'true') console.log(err) 
  })

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

  }).catch(err => {
    log.fatal(err);
    if(config.debug == 'true') console.log(err)
  });
});

bot.on('guildMemberRemove', member => {
  database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
    if(await res.length == 0) {
      database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, member_roles) VALUES (?, ?)`, [member.user.id, JSON.stringify(await getAllRoles(member)) ]).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err)
      });
    }else {
      if(JSON.parse(res[0].member_roles) === await getAllRoles(member)) return;
      else {
        database.query(`UPDATE ${member.guild.id}_guild_member_info SET member_roles = ? WHERE user_id = ?`, [JSON.stringify(await getAllRoles(member)), member.user.id]).catch(err => {
          log.fatal(err);
          if(config.debug == 'true') console.log(err)
        })
      }
    }
  });
});

//Command Manager
bot.on("messageCreate", async message => {

  await checkForScam(message, log, config, database, bot);

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
        }).catch(err => {
          log.fatal(err);
          if(config.debug == 'true') console.log(err);
        })
      }
    }else {
        if(!levelCooldown.has(message.author.id)) {
          gainXP(message);
          levelCooldown.add(message.author.id);
        }else {
          setTimeout(() => {
            levelCooldown.delete(message.author.id)
          }, lvlconfig.timeout);
        }
    }
  }).catch(err => {
    log.fatal(err);
    if(config.debug == 'true') console.log(err)
  });
});

bot.once('ready', () => {
  checkInfractions(bot);
  checkTemproles(bot)
  auditLog(bot);
  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server****`);
  log.info('------------BOT SUCCESSFULLY STARTED------------', new Date());
  bot.user.setActivity({
    name: "BETA",
    type: 'PLAYING'
  });
});

const token = require('./_secret/token.json');
const { checkForScam } = require("./utils/checkForScam/checkForScam");
bot.login(token.BOT_TOKEN);