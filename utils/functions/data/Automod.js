const guildAutomod = require('../../../src/db/Models/tables/guildAutomod.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const { kickUser } = require('../moderations/kickUser');
const { Guilds } = require('./Guilds');

class Automod {
    constructor() {}

    add(guild_id) {
        return new Promise(async (resolve, reject) => {
            await guildAutomod
                .create(
                    {
                        guild_id,
                    },
                    {
                        ignoreDuplicates: true,
                    }
                )
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            const guild = await Guilds.get(guild_id);
            const { settings } = await guild.getAutomod();
            return settings ? resolve(settings) : resolve([]);
        });
    }

    update({ guild_id, value, type }) {
        return new Promise(async (resolve, reject) => {
            await guildAutomod
                .update(
                    {
                        settings: value,
                    },
                    {
                        where: {
                            guild_id,
                        },
                    }
                )
                .then(() => {
                    return resolve();
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(err);
                });
        });
    }

    checkWhitelist({ setting, user_roles, role_id }) {
        let whitelist = setting.whitelistrole;
        if (!whitelist) return false;

        if (user_roles) {
            user_roles = user_roles.map((role) => role.id);
            whitelist = whitelist.roles.filter((r) => user_roles.includes(r));
            return whitelist.length > 0 ? true : false;
        }

        if (role_id) {
            return whitelist.roles.includes(role_id) ? true : false;
        }
    }

    punishUser({ user, guild, mod, action, bot, messages, channel }) {
        return new Promise(async (resolve) => {
            let actionTaken;
            switch (action) {
                case 'kick':
                    actionTaken = 'kick';
                    kickUser({
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: '[AUTO MOD] Spamming too many letters in a short time',
                        bot: bot,
                    });
                    break;
                case 'ban':
                    actionTaken = 'ban';
                    banUser({
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: '[AUTO MOD] Spamming too many letters in a short time.',
                        bot: bot,
                        isAuto: true,
                        time: '5h',
                        dbtime: getModTime('5h'),
                    });
                    break;

                case 'mute':
                    actionTaken = 'mute';
                    muteUser({
                        user: user,
                        mod: mod,
                        bot: bot,
                        guild: guild,
                        reason: '[AUTO MOD] Spamming too many letters in a short time.',
                        time: '5h',
                        dbtime: getModTime('5h'),
                    });
                    break;
                case 'delete':
                    actionTaken = 'delete';

                    if (!Array.isArray(messages)) {
                        messages.delete().catch((err) => {});
                        break;
                    }
                    for (let i in messages) {
                        channel.messages
                            .fetch(messages[i])
                            .then((msg) => {
                                msg.delete().catch((err) => {});
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                    break;

                case 'warn':
                    actionTaken = 'warn';
                    warnUser({
                        bot: bot,
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: '[AUTO MOD] Spamming too many letters in a short time.',
                    });
                    break;
            }

            return resolve(action);
        });
    }
}

module.exports.Automod = new Automod();
