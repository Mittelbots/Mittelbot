const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildBannerAdd = async (bot, guild, bannerURL) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**Banner added to ${guild}**`,
        imageUrl: bannerURL,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
