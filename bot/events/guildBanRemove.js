const Auditlog = require('~utils/classes/Auditlog');
const { setNewModLogMessage } = require('~utils/functions/modlog/modlog');
const config = require('~assets/json/_config/config.json');

module.exports.guildBanRemove = async (bot, guildBan) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(guildBan.guild.id, 'member_ban_remove');
    if (!isEnabled) return;
    const fetchedLogs = await guildBan.guild.fetchAuditLogs({
        limit: 1,
        type: 22,
    });

    const banLog = fetchedLogs.entries.first();
    if (!banLog) return;

    setNewModLogMessage(
        bot,
        config.defaultModTypes.unban,
        banLog.executor.id,
        banLog.target,
        null,
        null,
        guildBan.guild.id
    );
};
