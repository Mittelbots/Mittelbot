const { Automod } = require('../functions/data/Automod');
const { getModTime } = require('../functions/getModTime');
const { banUser } = require('../functions/moderations/banUser');
const { kickUser } = require('../functions/moderations/kickUser');
const { muteUser } = require('../functions/moderations/muteUser');
const { warnUser } = require('../functions/moderations/warnUser');

module.exports.antiInsults = async (message, bot) => {
    return new Promise(async (resolve, reject) => {
        const settings = await Automod.get(message.guild.id);
        const antiInsultsSetting = settings.antiinsults;
        if (
            !antiInsultsSetting ||
            antiInsultsSetting.length === 0 ||
            antiInsultsSetting.enabled ||
            antiInsultsSetting.action
        )
            return resolve(false);
        const isWhitelist = Automod.checkWhitelist({
            setting: antiInsultsSetting,
            user_roles: message.member.roles.cache,
        });
        if (isWhitelist) return resolve(false);

        const insults = antiInsultsSetting.insults;

        const isInsult = insults.some((insult) =>
            message.content.toLowerCase().includes(insult.toLowerCase())
        );
        if (!isInsult) return resolve(false);

        switch (antiInsultsSetting.action) {
            case 'kick':
                kickUser({
                    user: message.author,
                    mod: message.guild.me,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent an insult',
                    bot: bot,
                });
                break;
            case 'ban':
                banUser({
                    user: message.author,
                    mod: message.guild.me,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent an insult',
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
                    reason: '[AUTO MOD] Sent an insult',
                    time: '5d',
                    dbtime: getModTime('5d'),
                });
                break;

            case 'delete':
                message
                    .delete({
                        reason: '[AUTO MOD] Sent an insult',
                    })
                    .catch((err) => {});
                break;

            case 'warn':
                warnUser({
                    bot,
                    user: message.author,
                    mod: message.guild.me,
                    guild: message.guild,
                    reason: '[AUTO MOD] Sent an insult',
                });
                break;
        }

        return resolve(true);
    });
};
