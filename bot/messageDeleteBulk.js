const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.messageDeleteBulk = async (bot, messages) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, messages.first().guild.id);
    await auditLog.messageDeleteBulk(messages)
    await auditLog.send();
}