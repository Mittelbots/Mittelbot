const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.botDisconnect = async (bot, info) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'disc');
    await auditLog.disconnect(info);
    await auditLog.send();
};
