const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.botDebug = async (bot, info) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'debug');
    await auditLog.setEmbed({
        color: '#021982',
        text: `**Debug info** \n ${info}`,
    });
    await auditLog.send();
};
