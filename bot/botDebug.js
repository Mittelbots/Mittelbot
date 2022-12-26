const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.botDebug = async (bot, info) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'debug');
    await auditLog.debug(info);
    await auditLog.send();
};
