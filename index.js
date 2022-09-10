const {
  Client,
  Options,
  GatewayIntentBits,
  Collection,
  Partials
} = require("discord.js");

const config = require('./src/assets/json/_config/config.json');
const token = require('./_secret/token.json');
const version = require('./package.json').version;

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
  twitch_notifier
} = require("./src/events/notfifier/twitch_notifier");
const Dashboard = require("./dashboard/dashboard");
const {
  handleAddedReactions
} = require("./utils/functions/data/reactionroles");
const { setActivity } = require("./utils/functions/data/activity");
const { processErrorHandler } = require("./utils/functions/errorhandler/processErrorHandler");

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildBans, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  makeCache: Options.cacheWithLimits({
    MessageManager: 10,
    PresenceManager: 10,
    GuildMemberManager: 10
    // Add more class names here
  }),
  shards: 'auto'
});
bot.setMaxListeners(10);

bot.on('guildCreate', async (guild) => {
  guildCreate(guild, bot)
});

bot.commands = new Collection();

bot.version = version;

deployCommands(bot);
createSlashCommands();

bot.on('guildMemberAdd', member => {
  guildMemberAdd(member, bot)
});


bot.on('guildMemberRemove', member => {
  guildMemberRemove({
    member
  });
});

bot.on("messageCreate", message => {
  messageCreate(message, bot);
});

bot.on('messageReactionAdd', (reaction, user) => {
  handleAddedReactions({
    reaction,
    user,
    bot
  });
})

bot.on('messageReactionRemove', (reaction, user) => {
  handleAddedReactions({
    reaction,
    user,
    bot,
    remove: true
  });
})

processErrorHandler();

startUpCache();

if (!config.debug) {
  setTimeout(() => {
    db_backup();
  }, 60000);

  setTimeout(() => {
    db_backup();
  }, 86400000); // 24h
}

bot.once('ready', async () => {
  console.time('Fetching guilds and users in:')
  await bot.guilds.fetch().then(async guilds => {
    console.log('Guilds successfully fetched')
    await guilds.forEach(async guild => {
      await bot.guilds.cache.get(guild.id).members.fetch().then(() => {
        console.log('Members successfully fetched')
      })
    });
  })
  console.timeEnd('Fetching guilds and users in:')

  checkInfractions(bot, database);
  checkTemproles(bot, database)
  auditLog(bot);
  handleUploads({
    bot
  });
  twitch_notifier({
    bot
  })
  interactionCreate({
    bot
  })

  setActivity(bot);
  setInterval(() => {
    setActivity(bot);
  }, 3600000); // 1h


  //? START THE DASHBOARD
  Dashboard(bot);

  console.log(`****Ready! Logged in as  ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server(s)****`);
  errorhandler({
    err: '------------BOT SUCCESSFULLY STARTED------------' + new Date(),
    fatal: false
  });


});

bot.login(token.BOT_TOKEN);