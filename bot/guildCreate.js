const database = require('../src/db/db');
const {
  checkDatabase
} = require('../_scripts/checkDatabase');
const {
  errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const {
  delay
} = require('../utils/functions/delay/delay');
const {
  isGuildBlacklist
} = require('../utils/blacklist/guildBlacklist');
const {
  guildConfig,
  autoMod
} = require('../utils/functions/cache/cache');

async function guildCreate(guild, bot) {

  if (isGuildBlacklist({
      guild_id: guild.id
    })) {
    await bot.users.cache.get(guild.ownerId).send({
      content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.blackdayz.de/support.`
    }).catch(err => {})

    errorhandler({
      fatal: false,
      message: ` I joined a BLACKLISTED Guild: ${guild.name} (${guild.id})`
    });

    return guild.leave();
  }

  errorhandler({
    fatal: false,
    message: ` I joined a new Guild: ${guild.name} (${guild.id})`
  });

  await database.query(`INSERT IGNORE INTO all_guild_id (guild_id) VALUES (?)`, [guild.id]).catch(err => {
    errorhandler({
      err
    })
  })

  await delay(1000);

  await checkDatabase();

  await delay(4000);

  const defaultAntiSpamSetttings = {
    "antispam": {
      "enabled": false,
      "action": "[]"
    }
  }
  await database.query(`INSERT IGNORE INTO guild_automod (guild_id, settings) VALUES (?, ?)`, [guild.id, JSON.stringify(defaultAntiSpamSetttings)])
    .then(() => {
      autoMod[autoMod.length] = {
        name: "autoMod",
        id: guild.id,
        settings: JSON.stringify(defaultAntiSpamSetttings)
      }
    })
    .catch(err => {
      errorhandler({
        err
      })
    });

  await database.query(`INSERT IGNORE INTO guild_config (guild_id) VALUES (?); SELECT * FROM guild_config WHERE guild_id = ?`, [guild.id, guild.id])
    .then(res => {
      guildConfig[guildConfig.length] = {
        name: "guildConfig",
        id: guild.id,
        settings: Object.values(JSON.parse(JSON.stringify(res[1])))[0] // removes rowdatapacket object
      }
    })
    .catch(err => {
      errorhandler({
        err
      })
    });

  return;
}

module.exports = {
  guildCreate
}