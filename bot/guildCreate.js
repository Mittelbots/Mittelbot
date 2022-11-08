<<<<<<< HEAD
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { Guilds } = require('../utils/functions/data/Guilds');

module.exports.guildCreate = async (guild, bot) => {
    if (Guilds.isBlacklist(guild.id)) {
        await bot.users.cache
            .get(guild.ownerId)
            .send({
                content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.blackdayz.de/support.`,
            })
            .catch((err) => {});

        errorhandler({
            fatal: false,
            message: ` I joined a BLACKLISTED Guild: ${guild.name} (${guild.id})`,
        });

        return guild.leave().catch((err) => {});
    }
=======
const {
  errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const {
  isGuildBlacklist
} = require('../utils/blacklist/guildBlacklist');
const { insertGuildIntoGuildConfig } = require('../utils/functions/data/getConfig');
const { insertIntoGuildAutomod } = require('../utils/functions/data/automod');
const { insertIntoAllGuildId } = require('../utils/functions/data/all_guild_id');

module.exports.guildCreate = async (guild, bot) => {
  if (isGuildBlacklist({
      guild_id: guild.id
    })) {
    await bot.users.cache.get(guild.ownerId).send({
      content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.blackdayz.de/support.`
    }).catch(err => {})
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    errorhandler({
      fatal: false,
      message: ` I joined a BLACKLISTED Guild: ${guild.name} (${guild.id})`
    });

<<<<<<< HEAD
    Guilds.create(guild.id);
};
=======
    return guild.leave();
  }

  errorhandler({
    fatal: false,
    message: ` I joined a new Guild: ${guild.name} (${guild.id})`
  });

  await insertIntoAllGuildId(guild.id).catch(err => {})
  await insertIntoGuildAutomod(guild.id).catch(err => {})
  await insertGuildIntoGuildConfig(guild.id).catch(err => {})
  return;
}
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
