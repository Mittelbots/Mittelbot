const { Automod } = require('../functions/data/Automod');
const { getModTime } = require('../functions/getModTime');
const { banUser } = require('../functions/moderations/banUser');
const { kickUser } = require('../functions/moderations/kickUser');
const { muteUser } = require('../functions/moderations/muteUser');
const { warnUser } = require('../functions/moderations/warnUser');

module.exports.antiInvite = async (message, bot) => {
    const settings = await Automod.get(message.guild.id);
    const antiInviteSetting = settings.antiinvite;
    if (!antiInviteSetting || antiInviteSetting.length === 0) return false;
    const isWhitelist = Automod.checkWhitelist({
        setting: antiInviteSetting,
        user_roles: message.member.roles.cache,
    });
    if (isWhitelist) return false;
    if (!antiInviteSetting) return false;
    if (!antiInviteSetting.enabled) return false;

    let inviteRegex =
        /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;

    const isInvite = message.content.match(inviteRegex) ? true : false;

    if (isInvite) {
        if (antiInviteSetting.action) {
            switch (antiInviteSetting.action) {
                case 'kick':
                    kickUser({
                        user: message.author,
                        mod: message.guild.me,
                        guild: message.guild,
                        reason: '[AUTO MOD] Sent a discord invite link',
                        bot: bot,
                    });
                    break;
                case 'ban':
                    banUser({
                        user: message.author,
                        mod: message.guild.me,
                        guild: message.guild,
                        reason: '[AUTO MOD] Sent a discord invite link',
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
                        reason: '[AUTO MOD] Sent a discord invite link',
                        time: '5d',
                        dbtime: getModTime('5d'),
                    });
                    break;

                case 'delete':
                    message
                        .delete({
                            reason: '[AUTO MOD] Sent a discord invite link',
                        })
                        .catch((err) => {});
                    break;

                case 'warn':
                    warnUser({
                        bot,
                        user: message.author,
                        mod: message.guild.me,
                        guild: message.guild,
                        reason: '[AUTO MOD] Sent a discord invite link',
                    });
                    break;
            }
        }
        return isInvite;
    } else {
        return isInvite;
    }
};
