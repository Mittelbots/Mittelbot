const Auditlog = require('../utils/functions/data/Auditlog');
const { isOnBanList } = require('../utils/functions/moderations/checkOpenInfractions');
const { setNewModLogMessage } = require('../utils/modlog/modlog');
const config = require('../src/assets/json/_config/config.json');

module.exports.guildBanAdd = async (bot, guildBan) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(guildBan.guild.id, 'member_ban_add');
    if (!isEnabled) return;
    const banlist = await isOnBanList({
        user: guildBan.user,
        guild: guildBan.guild,
    });
    setNewModLogMessage(
        bot,
        config.defaultModTypes.ban,
        banlist[2].id,
        guildBan.user,
        banlist[1],
        null,
        guildBan.guild.id
    );
};
