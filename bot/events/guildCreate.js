const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const Guilds = require('~utils/classes/Guilds');

module.exports.guildCreate = async (guild, bot) => {
    const isOnBlacklist = await new Guilds().isBlacklist(guild.id);
    if (isOnBlacklist) {
        await bot.users.cache
            .get(guild.ownerId)
            .send({
                content: `Hello. I'm sorry but your server is on the blacklist and i'll leave your server again. If it's false please join the official discord support server. https://mittelbot.xyz/support.`,
            })
            .catch(() => {});

        errorhandler({
            fatal: false,
            message: `I joined a BLACKLISTED Guild: ${guild.name} (${guild.id})`,
            id: 1694432438,
        });

        return guild.leave().catch(() => {});
    }

    errorhandler({
        fatal: false,
        message: ` I joined a new Guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members.`,
        id: 1694432449,
    });

    new Guilds().create(guild.id);
};
