const Discord = require("discord.js");

const config = require('./src/assets/json/_config/config.json');
const token = require('./_secret/token.json');
const version = require('./package.json').version;
if (config.debug == 'true') var activity = require('./src/assets/json/_config/activity_dev.json');
else var activity = require('./src/assets/json/_config/activity_prod.json');

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
  log
} = require('./logs');
const {
  errorhandler
} = require('./utils/functions/errorhandler/errorhandler');
const {
  deployCommands
} = require("./utils/functions/deployCommands/deployCommands");

const {
  guildCreate
} = require("./bot/guildCreate");
const {
  messageCreate
} = require("./bot/messageCreate");
const {
  guildMemberAdd
} = require("./bot/guildMemberAdd");
const {
  guildMemberRemove
} = require("./bot/guildMemberRemove");
const database = require("./src/db/db");
const {
  getLinesOfCode
} = require("./utils/functions/getLinesOfCode/getLinesOfCode");
const {
  spawn
} = require('child_process');
const { db_backup } = require("./src/db/db_backup");
const { createSlashCommands } = require("./utils/functions/createSlashCommands/createSlashCommands");
const { handleSlashCommands } = require("./src/slash_commands");

const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS"],
  makeCache: Discord.Options.cacheWithLimits({
    MessageManager: 10,
    PresenceManager: 0,
    disableMentions: 'everyone'
    // Add more class names here
  }),
});
bot.setMaxListeners(10);

bot.on('guildCreate', async (guild) => {
  return await guildCreate(guild, bot)
});

bot.commands = new Discord.Collection();

deployCommands(bot);
createSlashCommands();

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
  errorhandler({err, fatal: true})

  errorhandler({err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`, fatal: true});
  spawn(process.argv[1], process.argv.slice(2), {
      detached: true,
      stdio: ['ignore', null, null]
  }).unref()
  process.exit()
});

process.on('uncaughtException', err => {
  errorhandler({err:'----BOT CRASHED-----', fatal: true});
  errorhandler({err, fatal: true})

  errorhandler({err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`, fatal: true});
  spawn(process.argv[1], process.argv.slice(2), {
      detached: true,
      stdio: ['ignore', null, null]
  }).unref()
  process.exit()
})

bot.once('ready', async () => {
  checkInfractions(bot, database);
  checkTemproles(bot, database)
  auditLog(bot);
  setActivity();
  
  if(config.debug == 'false') {
    db_backup();
    setTimeout(() => {
        db_backup();
    }, 86400000); // 24h
  }

  
  bot.on('interactionCreate', async (main_interaction) => {
    if(main_interaction.isCommand()) {
        handleSlashCommands({
            main_interaction: main_interaction,
            bot: bot
        })
      }
  });

  setInterval(() => {
    setActivity();
  }, 3600000); // 1h

  function setActivity() {
    getLinesOfCode((cb) => {
      var codeLines = ` | Lines of Code: ${cb}` || '';
      bot.user.setActivity({
        name: activity.name + ' v' + version + codeLines,
        type: activity.type,
      });
      log.info('------------BOT ACTIVITY SUCCESSFULLY STARTED------------', new Date())
    });
  }

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server****`);
  log.info('------------BOT SUCCESSFULLY STARTED------------', new Date());
});

bot.login(token.BOT_TOKEN);