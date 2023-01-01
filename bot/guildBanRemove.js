const Auditlog = require('../utils/functions/data/Auditlog');
const { setNewModLogMessage } = require('../utils/modlog/modlog');

module.exports.guildBanAdd = async (bot, guild, user) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(guild.id, 'member_ban_remove');
    if (!isEnabled) return;
    const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_REMOVED',
    });

    const banLog = fetchedLogs.entries.first();
    if (banLog) {
        var { executor, target } = banLog;
    }

    setNewModLogMessage(
        bot,
        config.defaultModTypes.unban,
        target.id === user.id ? executor.id : null,
        user.user,
        null,
        null,
        guild.id
    );
};
