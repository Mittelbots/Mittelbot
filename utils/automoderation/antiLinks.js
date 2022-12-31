const { Automod } = require('../functions/data/Automod');
const { getModTime } = require('../functions/getModTime');
const { banUser } = require('../functions/moderations/banUser');
const { kickUser } = require('../functions/moderations/kickUser');
const { muteUser } = require('../functions/moderations/muteUser');
const { warnUser } = require('../functions/moderations/warnUser');

module.exports.anitLinks = async (message, bot) => {
    return new Promise(async (resolve, reject) => {
        const setting = await Automod.get(message.guild.id);
        const antiLinksSetting = setting.antilinks;
        if (!antiLinksSetting || antiLinksSetting.length === 0) return resolve(false);
        const isWhitelist = Automod.checkWhitelist({
            setting: antiLinksSetting,
            user_roles: message.member.roles.cache,
        });
        if (isWhitelist) return resolve(false);

        if (!antiLinksSetting) return resolve(false);
        if (!antiLinksSetting.enabled) return resolve(false);

        let linkRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9]+\.)+[a-zA-Z0-9]+/;
        const isLink = message.content.match(linkRegex) ? true : false;

        if (!isLink || !antiLinksSetting.action) return resolve(false);

        switch (antiLinksSetting.action) {
            case 'kick':
                kickUser({
                    user: message.author,
                    mod: message.guild.me,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent a link',
                    bot: bot,
                });
                break;
            case 'ban':
                banUser({
                    user: message.author,
                    mod: message.guild.me,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent a link',
                    bot,
                    isAuto: true,
                    time: '5d',
                    dbtime: getModTime('5d'),
                });
                break;
            case 'mute':
                muteUser({
                    user: message.author,
                    mod: message.guild.me,
                    bot,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent a link',
                    time: '5d',
                    dbtime: getModTime('5d'),
                });
                break;
            case 'delete':
                message
                    .delete({
                        reason: '[AUTO MOD] Sent a link',
                    })
                    .catch((err) => {});
                break;

            case 'warn':
                warnUser({
                    user: message.author,
                    mod: message.guild.me,
                    bot,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent a link',
                });
                break;
            default:
                break;
        }

        return resolve(true);
    });
};
