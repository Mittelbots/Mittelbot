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
const { guildCreate } = require("./src/events/guildCreate/guildCreate");
const { log } = require('./logs');
const { errorhandler } = require('./utils/functions/errorhandler/errorhandler');
// const {
//   autoresponse
// } = require("./utils/autoresponse/autoresponse");
// const {
//   blacklist
// } = require("./utils/blacklist/blacklist");

const { giveAllRoles } = require("./utils/functions/roles/giveAllRoles");
const { getAllRoles } = require("./utils/functions/roles/getAllRoles");
const { checkForScam } = require("./utils/checkForScam/checkForScam");
const { deployCommands } = require("./utils/functions/deployCommands/deployCommands");

const lvlconfig = require('./src/assets/json/levelsystem/levelsystem.json');
const whitelist = require('./whitelist.json');
const token = require('./_secret/token.json');

const defaultCooldown = new Set();
const settingsCooldown = new Set();
const levelCooldown = new Set();

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"],
  makeCache: Discord.Options.cacheWithLimits({
		MessageManager: 0,
		PresenceManager: 0,
    disableMentions: 'everyone'
		// Add more class names here
	}),
});
bot.setMaxListeners(10);


bot.on('guildCreate', async (guild) => await guildCreate(database, guild, whitelist, log));

bot.commands = new Discord.Collection();

deployCommands(fs, log, config, bot);

bot.on('guildMemberAdd', member => {
  const database = new Database();

  database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
    if(await res.length == 0) {
      database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, user_joined) VALUES (?, ?)`, [member.user.id, new Date()]).catch(err => {
        log.fatal(err);
        return database.close();
      });
    }else {
      if(res[0].user_joined == null) {
        database.query(`UPDATE ${member.guild.id}_guild_member_info SET user_joined = ? WHERE user_id = ?`, [new Date(), member.user.id]).catch(err => {
          database.close();
          return errorhandler(err, config.errormessages.databasequeryerror, null, log, config)
        });
      }
      await database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND guild_id = ? AND mute = ?`, [member.user.id, member.guild.id, 1]).then(async inf => {
        if(await inf.length != 0) {
          member.roles.add([member.guild.roles.cache.find(r => r.name === 'Muted')]);
        }else {
          let user_roles = await res[0].member_roles;
          user_roles = JSON.parse(user_roles);

          //? IF MUTED ROLE IS IN USERS DATASET -> MUTED ROLE WILL BE REMOVED
          if(user_roles !== null && user_roles.indexOf(member.roles.cache.find(r => r.name === 'Muted')) !== -1) user_roles = user_roles.filter(val => {return val !== member.roles.cache.find(r => r.name === 'Muted').id});

          giveAllRoles(member, member.guild, user_roles, bot);
        }
      }).catch(err => {
        return log.fatal(err)
      });
    }
    database.close();
    return;
  }).catch(err => {
    return log.fatal(err)
  });

  database.query(`SELECT welcome_channel FROM ${member.guild.id}_config`).then(res => {
    if (res[0].welcome_channel !== null) {
      bot.channels.cache.find(c => c.id === res[0].welcome_channel).send('Welcome ' + member.user.username)
    }
  }).catch(err => { 
    if(config.debug == 'true') console.log(err) 
    return log.fatal(err);
  })

  database.query(`SELECT * FROM ${member.guild.id}_guild_joinroles`).then(res => {
    for (i in res) {
      let role = member.guild.roles.cache.find(r => r.id === res[i].role_id);
      //setTimeout(function () {
      try {
        member.roles.add(role);
      } catch (err) {
        //NO PERMISSONS
        return database.close();
      }
      // }, 10000);
    }

  }).catch(err => {
    if(config.debug == 'true') console.log(err)
    return log.fatal(err);
  });
});


bot.on('guildMemberRemove', member => {
  const database = new Database();
  
  database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
    if(await res.length == 0) {
      database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, member_roles) VALUES (?, ?)`, [member.user.id, JSON.stringify(await getAllRoles(member)) ]).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err)
        return database.close();
      });
    }else {
      if(JSON.parse(res[0].member_roles) === await getAllRoles(member)) return;
      else {
        database.query(`UPDATE ${member.guild.id}_guild_member_info SET member_roles = ? WHERE user_id = ?`, [JSON.stringify(await getAllRoles(member)), member.user.id]).catch(err => {
          log.fatal(err);
          if(config.debug == 'true') console.log(err)
          return database.close();
        })
      }
    }
  }).catch(err =>{
    log.fatal(err)
    if(config.debug == 'true') console.log(err);
    return database.close();
  });
});



//Command Manager
bot.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (message.author.system) return;
  // blacklist(1, message);
  // autoresponse(message);

  const database = new Database();

  await checkForScam(message, database, bot, config, log)
  
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
          if(settingsCooldown.has(message.author.id) && cmd === `${prefix[0].prefix}settings`) {
            database.close()
            return message.channel.send(`You have to wait ${config.defaultSettingsCooldown.text} after each Settings Command.`);
          }
          else {
            settingsCooldown.add(message.author.id);
            setTimeout(async () => {
              settingsCooldown.delete(message.author.id);
            }, config.defaultSettingsCooldown.format);
          }

          if (defaultCooldown.has(message.author.id)) {
            database.close()
            return message.channel.send(`You have to wait ${res[0].cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`);
          } else {
            defaultCooldown.add(message.author.id);
            commandfile.run(bot, message, args);

            setTimeout(async () => {
              defaultCooldown.delete(message.author.id);
            }, res[0].cooldown || config.defaultCooldown.format);

          }
        }).catch(err => {
          if(config.debug == 'true') console.log(err);
          return log.fatal(err);
        })
      }
    }else {
        if(!levelCooldown.has(message.author.id)) {
          gainXP(message, database);
          levelCooldown.add(message.author.id);
        }else {
          setTimeout(() => {
            levelCooldown.delete(message.author.id)
          }, lvlconfig.timeout);
        }
    }
  }).catch(err => {
    if(config.debug == 'true') console.log(err)
    return log.fatal(err);
  });
});

process.on('unhandledRejection', err => {
  return errorhandler(err, null, null, log, config)
});

process.on('uncaughtException', err => {
  return errorhandler(err, null, null, log, config)
})

bot.once('ready', async () => {
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


bot.login(token.BOT_TOKEN);