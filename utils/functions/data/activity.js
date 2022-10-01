const { getLinesOfCode } = require("../getLinesOfCode/getLinesOfCode");

const config = require('../../../src/assets/json/_config/config.json');
const { ActivityType } = require("discord.js");
const { errorhandler } = require("../errorhandler/errorhandler");
if (JSON.parse(process.env.DEBUG)) var activity = require('../../../src/assets/json/_config/activity_dev.json');
else var activity = require('../../../src/assets/json/_config/activity_prod.json');

module.exports.setActivity = (bot, restart = false) => {

  if(restart) {
    return bot.user.setActivity({
      name: 'Restarting...',
      type: ActivityType.Playing,
    });
  }

    getLinesOfCode((cb) => {
      let membersCount = bot.guilds.cache.map(guild => guild.memberCount).reduce((a, b) => a + b, 0)
      var codeLines = ` | ${bot.guilds.cache.size} guilds with ${membersCount} members | Code: ${cb}` || '';
      bot.user.setActivity({
        name: activity.name + ' v' + bot.version + codeLines,
        type: ActivityType.Playing,
      });
      errorhandler({
        err: '------------BOT ACTIVITY SUCCESSFULLY STARTED------------' + new Date(),
        fatal: false
      });
    });
  }