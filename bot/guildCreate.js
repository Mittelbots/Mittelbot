const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { isGuildBlacklist } = require('../utils/blacklist/guildBlacklist');
const { insertGuildIntoGuildConfig } = require('../utils/functions/data/getConfig');
const { insertIntoGuildAutomod } = require('../utils/functions/data/automod');
const { insertIntoAllGuildId } = require('../utils/functions/data/all_guild_id');

module.exports.guildCreate = async (guild, bot) => {
    if (
        isGuildBlacklist({
            guild_id: guild.id,
        })
    ) {
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

        return guild.leave();
    }

    errorhandler({
        fatal: false,
        message: ` I joined a new Guild: ${guild.name} (${guild.id})`,
    });

    await insertIntoAllGuildId(guild.id).catch((err) => {});
    await insertIntoGuildAutomod(guild.id).catch((err) => {});
    await insertGuildIntoGuildConfig(guild.id).catch((err) => {});
    return;
};
