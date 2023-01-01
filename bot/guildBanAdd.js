const Auditlog = require('../utils/functions/data/Auditlog');
const { isOnBanList } = require('../utils/functions/moderations/checkOpenInfractions');
const { setNewModLogMessage } = require('../utils/modlog/modlog');

module.exports.guildBanAdd = async (bot, guild, user) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(guild.id, 'member_ban_add');
    if (!isEnabled) return;
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
