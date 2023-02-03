const { Automod } = require('../functions/data/Automod');
const { getModTime } = require('../functions/getModTime');
const { banUser } = require('../functions/moderations/banUser');
const { kickUser } = require('../functions/moderations/kickUser');
const { muteUser } = require('../functions/moderations/muteUser');
const { warnUser } = require('../functions/moderations/warnUser');

let spamCheck = [];
let userAction = [];

module.exports.antiSpam = async (message, bot) => {
    const setting = await Automod.get(message.guild.id);
    const antiSpamSetting = setting.antispam;

    const isWhitelist = Automod.checkWhitelist({
        setting: antiSpamSetting,
        user_roles: message.member.roles.cache,
    });
    if (isWhitelist) return false;

    if (!antiSpamSetting) return false;
    if (!antiSpamSetting.enabled) return false;

    let user;
    let isSpam = false;
    //? CHECK IF USER EXISTS
    user = spamCheck.find(
        (user) => user.user_id === message.author.id && user.guild_id === message.guild.id
    );

    //? IF USER EXISTS
    if (user) {
        const first_message = user.first_message;

        const current_time = new Date().getTime();

        user.messages.push(message);

        const diff = first_message - current_time;
        const secondsBetween = Math.abs(diff / 1000);

        if (user.messages.length >= 6 || (user.messages.length >= 4 && secondsBetween <= 4)) {
            if (secondsBetween <= 4) {
                user.first_message = current_time;
                const alreadyPunished =
                    userAction.filter(
                        (u) =>
                            u.user_id === user.user_id &&
                            (u.guild_id === user.guild_id) & (u.action !== 'delete')
                    ).length === 0;

                if (antiSpamSetting.action && alreadyPunished) {
                    const obj = {
                        guild_id: message.guild.id,
                        user_id: message.author.id,
                        action: '',
                    };
                    switch (antiSpamSetting.action) {
                        case 'kick':
                            obj.action = 'kick';
                            kickUser({
                                user: message.author,
                                mod: message.guild.me,
                                guild: message.guild,
                                reason: '[AUTO MOD] Spamming too many letters in a short time',
                                bot: bot,
                            });
                            break;
                        case 'ban':
                            obj.action = 'ban';
                            banUser({
                                user: message.author,
                                mod: message.guild.me,
                                guild: message.guild,
                                reason: '[AUTO MOD] Spamming too many letters in a short time.',
                                bot,
                                isAuto: true,
                                time: '5d',
                                dbtime: getModTime('5d'),
                            });
                            break;

                        case 'mute':
                            obj.action = 'mute';
                            muteUser({
                                user: message.author,
                                mod: message.guild.me,
                                bot,
                                guild: message.guild,
                                reason: '[AUTO MOD] Spamming too many letters in a short time.',
                                time: '5d',
                                dbtime: getModTime('5d'),
                            });
                            break;

                        case 'delete':
                            message.channel.messages
                                .fetch({
                                    limit: 30,
                                })
                                .then((messages) => {
                                    messages = messages.filter(
                                        (m) => m.author.id === message.author.id
                                    );
                                    message.channel.bulkDelete(messages).catch((err) => {});
                                })
                                .catch((err) => {});
                            break;

                        case 'warn':
                            obj.action = 'warn';
                            warnUser({
                                bot,
                                user: message.author,
                                mod: message.guild.me,
                                guild: message.guild,
                                reason: '[AUTO MOD] Spamming too many letters in a short time.',
                            });
                            break;
                    }
                    userAction.push(obj);
                }

                user.messages = [];
                return (isSpam = true);
            }
        }

        //? UPDATE SPAMCHECK
        if (user.messages.length >= 6) {
            user.first_message = current_time;
        }
        user.last_message = current_time;

        for (let i in spamCheck) {
            if (
                spamCheck[i].user_id === message.author.id &&
                spamCheck[i].guild_id === message.guild.id
            ) {
                spamCheck[i] = user;
                break;
            }
        }
    } else {
        addUser();
    }

    function addUser() {
        //? INSERT USER TO SPAMCHECK
        const obj = {
            guild_id: message.guild.id,
            user_id: message.author.id,
            first_message: new Date().getTime(),
            last_message: new Date().getTime(),
            messages: [message],
            message_count: 1,
        };
        spamCheck.push(obj);
    }

    setTimeout(() => {
        userAction = userAction.filter(
            (u) => u.guild_id !== message.guild.id && u.user_id !== message.author.id
        );
        spamCheck = spamCheck.filter(
            (u) => u.guild_id !== message.guild.id && u.user_id !== message.author.id
        );
    }, 30000);

    return isSpam;
};
