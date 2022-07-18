const {Client, Options, GatewayIntentBits, Collection, ActivityType } = require("discord.js");

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
  interactionCreate
} = require('./bot/interactionCreate');
const {
  guildMemberRemove
} = require("./bot/guildMemberRemove");
const database = require("./src/db/db");
const {
  getLinesOfCode
} = require("./utils/functions/getLinesOfCode/getLinesOfCode");
const {
  spawn, exec
} = require('child_process');
const {
  db_backup
} = require("./src/db/db_backup");
const {
  createSlashCommands
} = require("./utils/functions/createSlashCommands/createSlashCommands");
const {
  handleUploads
} = require("./src/events/notfifier/yt_notifier");
const {
  startUpCache
} = require("./utils/functions/cache/startUpCache");
const {
  delay
} = require("./utils/functions/delay/delay");
const { twitch_notifier } = require("./src/events/notfifier/twitch_notifier");
const { sendEmailToOwner } = require("./utils/functions/sendEmail/sendEmail");
const crashs = require("./crashs.json");

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates , GatewayIntentBits.GuildMessageReactions , GatewayIntentBits.GuildBans, GatewayIntentBits.MessageContent],
  makeCache: Options.cacheWithLimits({
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

bot.commands = new Collection();

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

process.on('unhandledRejection', async err => {
  errorhandler({
    err,
    fatal: true
  })

  errorhandler({
    err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
    fatal: true
  });

  crashs.count = crashs.count++;
  crashs.err = err;
  await delay(5000);
  spawn(process.argv[1], process.argv.slice(2), {
    detached: true,
    stdio: ['ignore', null, null]
  }).unref()
  process.exit()
});

process.on('uncaughtException', async err => {
  errorhandler({
    err: '----BOT CRASHED-----',
    fatal: true
  });
  errorhandler({
    err,
    fatal: true
  })

  crashs.count = crashs.count++;
  crashs.err = err;
  await delay(5000);
  spawn(process.argv[1], process.argv.slice(2), {
    detached: true,
    stdio: ['ignore', null, null]
  }).unref()

  errorhandler({
    err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
    fatal: true
  });

  process.exit()
})


bot.once('ready', async () => {

  if(crashs.count > 30) {
    await sendEmailToOwner(crashs.err);
    return exec(`kill ${process.pid}`);
  };

  setTimeout(() => {
    crashs.count = 0;
  }, 43200000) // 12hrs

  await startUpCache();

  checkInfractions(bot, database);
  checkTemproles(bot, database)
  auditLog(bot);
  setActivity();
  handleUploads({
    bot
  });
  twitch_notifier({
    bot
  })
  interactionCreate({
    bot
  })

  if (config.debug == 'false') {
    setTimeout(() => {
      db_backup();
    }, 60000);

    setTimeout(() => {
      db_backup();
    }, 86400000); // 24h
  }

  setInterval(() => {
    setActivity();
  }, 3600000); // 1h

  function setActivity() {
    getLinesOfCode((cb) => {
      let membersCount = bot.guilds.cache.map(guild => guild.memberCount).reduce((a, b) => a + b, 0)
      var codeLines = ` | ${bot.guilds.cache.size} guilds with ${membersCount} members | Code: ${cb}` || '';
      bot.user.setActivity({
        name: activity.name + ' v' + version + codeLines,
        type: ActivityType.Playing,
      });
      log.info('------------BOT ACTIVITY SUCCESSFULLY STARTED------------', new Date())
    });
  }

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server(s)****`);
  log.info('------------BOT SUCCESSFULLY STARTED------------', new Date());
});

bot.login(token.BOT_TOKEN);