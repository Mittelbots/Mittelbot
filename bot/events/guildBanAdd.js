const Auditlog = require('~utils/classes/Auditlog');
const { isOnBanList } = require('~utils/functions/moderations/checkOpenInfractions');
const { setNewModLogMessage } = require('~utils/functions/modlog/modlog');
const config = require('~assets/json/_config/config.json');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');

module.exports.guildBanAdd = async (bot, guildBan) => {
    try {
        const auditLog = new Auditlog();
        const isEnabled = await auditLog.checkEnabledEvents(guildBan.guild.id, 'member_ban_add');
        if (!isEnabled) return;
        const banlist = await isOnBanList({
            user: guildBan.user,
            guild: guildBan.guild,
        });

        if (!banlist || banlist[0]) return;

        setNewModLogMessage(
            bot,
            config.defaultModTypes.ban,
            banlist[2]?.id ? banlist[2].id : null,
            guildBan.user,
            banlist[1] ? banlist[1] : banlist[2],
            null,
            guildBan.guild.id
        );
    } catch (err) {
        errorhandler({ err });
    }
};
