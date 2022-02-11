const Discord = require("discord.js");
const fs = require('fs');

const config = require('./src/assets/json/_config/config.json');

const {
  checkInfractions
} = require("./src/events/checkInfraction");
const {
  checkTemproles
} = require("./src/events/checkTemproles");
const {
  auditLog
} = require("./utils/auditlog/auditlog");

const { log } = require('./logs');
const { errorhandler } = require('./utils/functions/errorhandler/errorhandler');
// const {
//   autoresponse
// } = require("./utils/autoresponse/autoresponse");
// const {
//   blacklist
// } = require("./utils/blacklist/blacklist");


const { deployCommands } = require("./utils/functions/deployCommands/deployCommands");

const token = require('./_secret/token.json');

const { guildCreate } = require("./bot/guildCreate");
const { messageCreate } = require("./bot/messageCreate");
const { guildMemberAdd } = require("./bot/guildMemberAdd");
const {guildMemberRemove} = require("./bot/guildMemberRemove");
const { Database } = require("./src/db/db");
const { getLinesOfCode } = require("./utils/functions/getLinesOfCode/getLinesOfCode");

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"],
  makeCache: Discord.Options.cacheWithLimits({
		MessageManager: 10,
		PresenceManager: 0,
    disableMentions: 'everyone'
		// Add more class names here
	}),
});
bot.setMaxListeners(10);

var database = new Database();

// RE NEW EVERY HOUR THE DATBASE CONNECTION
setInterval(async () => {
  await database.close();
  database = new Database();
  console.log('------------DATABASE SUCCESSFULLY RESTARTED------------')
}, 3600000);

bot.on('guildCreate', async (guild) => {
  return await guildCreate(guild, database)
});

bot.commands = new Discord.Collection();

deployCommands(bot);

bot.on('guildMemberAdd', async member => {
  return await guildMemberAdd(member, bot)
});


bot.on('guildMemberRemove', async member => {
  return await guildMemberRemove(member);
});


bot.on("messageCreate", async message => {
  return await messageCreate(message, bot);
});

process.on('unhandledRejection', err => {
  return errorhandler(err, null, null, log, config)
});

process.on('uncaughtException', err => {
  return errorhandler(err, null, null, log, config)
})

bot.once('ready', async () => {
  checkInfractions(bot, new Database());
  checkTemproles(bot, new Database())
  auditLog(bot, database);
  
  var codeLines;
  await getLinesOfCode((cb) => {
    setTimeout(() => {
      return codeLines = ` | Lines of Code: ${cb}` || '';
    }, 1000);
  });

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server****`);

  log.info('------------BOT SUCCESSFULLY STARTED------------', new Date());

  setTimeout(() => {
    bot.user.setActivity({
      name: config.activity.playing.name + codeLines,
      type: config.activity.playing.type
    });
  }, 1100);
});

bot.login(token.BOT_TOKEN);