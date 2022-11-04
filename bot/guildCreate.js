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

        return guild.leave();
    }

    errorhandler({
        fatal: false,
        message: ` I joined a new Guild: ${guild.name} (${guild.id})`,
    });

    Guilds.create(guild.id);
};
