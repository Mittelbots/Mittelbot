const {
    spawn,
  } = require('child_process');
const { checkInfractions } = require('../../src/events/checkInfraction');
const { checkTemproles } = require('../../src/events/checkTemproles');
const { twitch_notifier } = require('../../src/events/notfifier/twitch_notifier');
const { handleUploads } = require('../../src/events/notfifier/yt_notifier');
const { auditLog } = require('../../utils/auditlog/auditlog');
const { startUpCache } = require('../../utils/functions/cache/startUpCache');
const { createSlashCommands } = require('../../utils/functions/createSlashCommands/createSlashCommands');
const { setActivity } = require('../../utils/functions/data/activity');
const { handleAddedReactions } = require('../../utils/functions/data/reactionroles');
const { delay } = require('../../utils/functions/delay/delay');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const { deployCommands } = require('../../utils/functions/deployCommands/deployCommands');
const { guildCreate } = require('../guildCreate');
const { guildMemberAdd } = require('../guildMemberAdd');
const { guildMemberRemove } = require('../guildMemberRemove');
const { interactionCreate } = require('../interactionCreate');
const { messageCreate } = require('../messageCreate');
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

      await this.fetchCache(bot);

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

      console.log(`****Ready! Logged in as ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server(s)****`);
      errorhandler({
        message: '------------BOT SUCCESSFULLY STARTED------------' + new Date(),
        fatal: false
      });

      return resolve(true);
    }catch(err) {
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
  console.time('Fetching guilds and users in:')
  await bot.guilds.fetch().then(async guilds => {
    console.log('Guilds successfully fetched')
    await guilds.forEach(async guild => {
      await bot.guilds.cache.get(guild.id).members.fetch().then(() => {
        console.log('Members successfully fetched')
      })
    });
  })
  console.timeEnd('Fetching guilds and users in:');

  return true;
}