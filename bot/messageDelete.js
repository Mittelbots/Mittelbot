const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageDelete = async (bot, message) => {
    if (!message.author) return;
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(message.guild.id, 'message_delete');
    if (!isEnabled) return;
    await auditLog.init(bot, message.guild.id, true);
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**Message sent by <@${message.author.id}> deleted in <#${message.channelId}>** \n${
            message.attachments.first() !== undefined ? '' : message
        }`,
        imageUrl: message.attachments.first() !== undefined ? attachment : null,
    });

    await auditLog.sendToAuditLog({
        guildId: message.guild.id,
        target: message,
    });
};
