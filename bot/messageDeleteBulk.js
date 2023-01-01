const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageDeleteBulk = async (bot, messages) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(
        message.first().guild.id,
        'message_bulk_delete'
    );
    if (!isEnabled) return;
    await auditLog.init(bot, messages.first().guild.id);
    await auditLog.messageDeleteBulk(messages);
    await auditLog.send();
};
