const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.botReconnecting = async (bot, info) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'reco');
    await auditLog.reconnecting(info)
    await auditLog.send();
}