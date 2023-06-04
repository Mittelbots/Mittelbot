const Auditlog = require('~utils/classes/Auditlog');

module.exports.messageDeleteBulk = async (bot, messages) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(
        messages.first().guild.id,
        'message_bulk_delete'
    );
    if (!isEnabled) return;
    await auditLog.init(bot, messages.first().guild.id, true);
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**${messages.size} messages deleted in <#${messages.first().channelId}>**`,
    });
    await auditLog.send();
};
