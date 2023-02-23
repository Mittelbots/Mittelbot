const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.guildUpdate = async (bot, guildBefore, guildAfter) => {
    const auditLog = new Auditlog();
    guildBefore.guild = {};
    guildBefore.guild.id = guildBefore.guildId;
    await auditLog.init(bot, guildBefore.guildId);
    await auditLog.setEmbed({
        color: '#021982',
        text: `**Guild updated**\n**Before**\n${guildBefore}\n**After**\n${guildAfter}`,
    });
    await auditLog.sendToAuditLog({
        guildId: guildBefore.guildId,
        target: guildBefore,
    });
};
