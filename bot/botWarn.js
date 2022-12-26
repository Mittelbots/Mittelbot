const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.botWarn = async (bot, warn) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'warn');
    await auditLog.warn(warn)
    await auditLog.send();
}