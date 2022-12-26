const { isOnBanList } = require('../utils/functions/moderations/checkOpenInfractions');
const { setNewModLogMessage } = require('../utils/modlog/modlog');

module.exports.guildBanAdd = async (bot, guild, user) => {
    const banlist = await isOnBanList({
        user: user.user,
        guild: guild,
    });
    setNewModLogMessage(
        bot,
        config.defaultModTypes.ban,
        banlist[2].id,
        user.user,
        banlist[1],
        null,
        user.guild.id
    );
};
