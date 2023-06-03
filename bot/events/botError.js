const Auditlog = require('../../utils/functions/data/Auditlog');

module.exports.botError = async (bot, error) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'err');
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**Error** \n ${error}`,
    });
    await auditLog.send();
};
