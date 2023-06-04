const { Message } = require('discord.js');
const guildAutomod = require('~src/db/Models/guildAutomod.model');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { kickUser } = require('~utils/functions/moderations/kickUser');
const Guilds = require('~utils/classes/Guilds');
const { banUser } = require('~utils/functions/moderations/banUser');
const { getModTime } = require('~utils/functions/getModTime');
const { muteUser } = require('~utils/functions/moderations/muteUser');
const { warnUser } = require('~utils/functions/moderations/warnUser');
const { messageDeleteReasons } = require('~assets/js/messageDeleteReasons');

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

    get(guild_id, type) {
        return new Promise(async (resolve, reject) => {
            const guild = await new Guilds().get(guild_id);
            const automod = await guild.getAutomod();
            const settings = automod[type];
            return settings ? resolve(settings) : resolve({});
        });
    }

    update({ guild_id, value, type }) {
        return new Promise(async (resolve, reject) => {
            await guildAutomod
                .update(
                    {
                        [type]: value,
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

    checkWhitelist({ setting, user_roles, message, role_id, guild_id }) {
        return new Promise(async (resolve) => {
            if (await this.checkGlobalWhitelist({ guild_id, user_roles, role_id })) {
                return resolve(true);
            }

            const whitelistroles = setting?.whitelistroles || [];
            const whitelistchannels = setting?.whitelistchannels || [];
            const whitelistinvites = setting?.whitelistinvites || [];

            let isWhitelisted = false;

            if (user_roles || role_id) {
                const filteredWhitelist = whitelistroles.filter(
                    (role) => user_roles.includes(role) || role === role_id
                );
                isWhitelisted = filteredWhitelist.length > 0;
            }

            if (message instanceof Message && !isWhitelisted) {
                const filteredWhitelistChannels = whitelistchannels.filter(
                    (channel) => message.channel.id === channel
                );
                const filteredWhitelistInvites = whitelistinvites.filter((invite) =>
                    message.content.includes(invite)
                );
                isWhitelisted =
                    filteredWhitelistChannels.length > 0 || filteredWhitelistInvites.length > 0;
            }

            return resolve(isWhitelisted);
        });
    }

    checkGlobalWhitelist({ guild_id, user_roles, role_id }) {
        return new Promise(async (resolve) => {
            const globalWhitelist = await this.get(guild_id, 'whitelist');
            if (!globalWhitelist) {
                return resolve(false);
            }

            const whitelist = globalWhitelist.roles || [];

            if (user_roles) {
                const userRoleIds = user_roles.map((role) => role.id);
                const filteredWhitelist = whitelist.filter((role) => userRoleIds.includes(role));
                return resolve(filteredWhitelist.length > 0);
            }

            if (role_id) {
                return resolve(whitelist.includes(role_id));
            }

            return resolve(false);
        });
    }

    punishUser({ user, guild, mod, action, bot, messages, channel, reason }) {
        return new Promise(async (resolve) => {
            const punishReason = '[AUTO MOD]' + reason;

            let actionTaken;
            switch (action) {
                case 'kick':
                    actionTaken = 'kick';
                    kickUser({
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: punishReason,
                        bot: bot,
                    });
                    break;
                case 'ban':
                    actionTaken = 'ban';
                    banUser({
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: punishReason,
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
                        reason: punishReason,
                        time: '5h',
                        dbtime: getModTime('5h'),
                    });
                    break;
                case 'delete':
                    actionTaken = 'delete';

                    if (!Array.isArray(messages)) {
                        messages.delete().catch(() => {});
                        break;
                    }
                    for (let i in messages) {
                        channel.messages
                            .fetch(messages[i])
                            .then((msg) => {
                                messageDeleteReasons.set(msg.id, reason);
                                msg.delete().catch(() => {});
                            })
                            .catch(() => {});
                    }
                    break;

                case 'warn':
                    actionTaken = 'warn';
                    warnUser({
                        bot: bot,
                        user: user,
                        mod: mod,
                        guild: guild,
                        reason: punishReason,
                    });
                    break;
            }

            return resolve(actionTaken);
        });
    }
}

module.exports = Automod;
