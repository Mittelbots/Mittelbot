const {
  spawn,
} = require('child_process');
const {
  checkInfractions
} = require('../../src/events/checkInfraction');
const {
  checkTemproles
} = require('../../src/events/checkTemproles');
const {
  twitch_notifier
} = require('../../src/events/notfifier/twitch_notifier');
const {
  handleUploads
} = require('../../src/events/notfifier/yt_notifier');
const {
  auditLog
} = require('../../utils/auditlog/auditlog');
const {
  startUpCache
} = require('../../utils/functions/cache/startUpCache');
const {
  createSlashCommands
} = require('../../utils/functions/createSlashCommands/createSlashCommands');
const {
  setActivity
} = require('../../utils/functions/data/activity');
const {
  handleAddedReactions
} = require('../../utils/functions/data/reactionroles');
const {
  delay
} = require('../../utils/functions/delay/delay');
const {
  errorhandler
} = require('../../utils/functions/errorhandler/errorhandler');
const {
  deployCommands
} = require('../../utils/functions/deployCommands/deployCommands');
const {
  guildCreate
} = require('../guildCreate');
const {
  guildMemberAdd
} = require('../guildMemberAdd');
const {
  guildMemberRemove
} = require('../guildMemberRemove');
const {
  interactionCreate
} = require('../interactionCreate');
const {
  messageCreate
} = require('../messageCreate');
const Dashboard = require('../../dashboard/dashboard');

module.exports.restartBot = async () => {
  await delay(5000);

  spawn(process.argv[1], process.argv.slice(2), {
    detached: true,
    stdio: ['ignore', null, null]
  }).unref()
  process.exit();
}


module.exports.startBot = async (bot) => {
  return new Promise(async (resolve, reject) => {
    try {
      await setActivity(bot, true);

      await deployCommands(bot);

      await createSlashCommands();

      await startUpCache();

      await Promise.resolve(this.fetchCache(bot));

      auditLog(bot);
      handleUploads({
        bot
      });
      twitch_notifier({
        bot
      })

      checkInfractions(bot);
      checkTemproles(bot);

      //? START THE DASHBOARD
      Dashboard(bot);

      setActivity(bot);

      console.info(`****Ready! Logged in as ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server(s)****`);
      errorhandler({
        message: '------------BOT SUCCESSFULLY STARTED------------' + new Date(),
        fatal: false
      });

      return resolve(true);
    } catch (err) {
      return reject(err);
    }
  })
}


module.exports.acceptBotInteraction = (bot) => {

  bot.on('guildCreate', async (guild) => {
    guildCreate(guild, bot)
  });

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
  });

  interactionCreate({
    bot
  })
}


module.exports.fetchCache = async (bot) => {
  return new Promise(async (resolve, reject) => {
    console.time('Fetching guilds in:');
    const guilds = await bot.guilds.fetch();
    console.timeEnd('Fetching guilds in:');

    console.time('Fetching users in:');
    await Promise.resolve(this.fetchUsers(bot, guilds));
    console.timeEnd('Fetching users in:');

    return resolve(true);
  })
}

module.exports.fetchUsers = async (bot, guilds) => {
  return new Promise(async (resolve, reject) => {
    let i = 0;
    let length = guilds.size;

    return await guilds.map(async guild => {
      await bot.guilds.cache.get(guild.id).members.fetch().then(() => {
        console.info(`Members from ${guild.name}(${guild.id}) successfully fetched`);
        i = i + 1;
      });
      if (i === length) {
        return resolve(true)
      };
    });
  })
}