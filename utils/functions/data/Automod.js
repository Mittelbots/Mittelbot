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
                    return resolve(
                        `✅ Successfully updated automod settings for your guild to \`${type}\`.`
                    );
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(
                        `❌ Error updating automod settings for your guild to \`${type}\`.`
                    );
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

    punishUser({ user, guild, mod, action, bot, message }) {
        return new Promise(async (resolve, reject) => {
            let action;
            switch( action ) {
                case 'kick':
                    action = 'kick';
                    kickUser({
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: '[AUTO MOD] Spamming too many letters in a short time',
                        bot: bot
                    });
                    break;
                case 'ban':
                    action = 'ban';
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
                    action = 'mute';
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
                    action = 'delete';
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
                    action = 'warn';
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
        })
    }
}

module.exports.Automod = new Automod();
