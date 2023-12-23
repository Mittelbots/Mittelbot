const Auditlog = require('~utils/classes/Auditlog');
const { messageDeleteReasons } = require('~assets/js/messageDeleteReasons');

module.exports.messageDelete = async (bot, message) => {
    if (!message.author || !message.guild) return;
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(message.guild.id, 'message_delete');
    if (!isEnabled) return;
    await auditLog.init(bot, message.guild.id, true);
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**Message sent by <@${message.author.id}> deleted in <#${message.channelId}>** \n${
            message.attachments.first() !== undefined ? '' : message
        }\n\n**Reason:**\n${messageDeleteReasons.get(message.id) || 'No reason provided'}`,
        imageUrl: message.attachments.first() !== undefined ? message.attachments.first() : null,
    });

    messageDeleteReasons.delete(message.id);

    await auditLog.sendToAuditLog({
        guildId: message.guild.id,
        target: message,
    });
};
