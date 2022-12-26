const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.botError = async (bot, error) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'err');
    await auditLog.error(error)
    await auditLog.send();
}