const { EmbedBuilder } = require('discord.js');
const { removeMention, removeEmojiTags } = require('../removeCharacters');
const GuildConfig = require('~utils/classes/Config');

module.exports.updateReactionRoles = async ({
    guild_id,
    message_link,
    roles,
    emojis,
    main_interaction,
}) => {
    return new Promise(async (resolve, reject) => {
        roles = removeMention(roles).split(' ');
        emojis = emojis.split(' ');

        let length = roles.length;

        for (let i in emojis) {
            emojis[i] = removeEmojiTags(emojis[i]);
        }

        if (roles.length !== emojis.length) {
            return reject(global.t.trans(['error.admin.reactionroles.notEqual'], guild_id));
        }

        const messageLink = message_link.split('/');
        const channel = messageLink[messageLink.length - 2];
        const messageId = messageLink[messageLink.length - 1];

        if (!messageLink || !channel || !messageId) {
            return reject(
                global.t.trans(['error.admin.reactionroles.messageLinkNotValid'], guild_id)
            );
        }

        const message = await main_interaction.bot.guilds.cache
            .get(guild_id)
            .channels.cache.get(channel)
            .messages.fetch(messageId);

        if (!message) {
            return reject(global.t.trans(['error.admin.reactionroles.messageNotFound'], guild_id));
        }

        for (let i in roles) {
            let isDefault = false;
            if (isNaN(emojis[i])) {
                try {
                    message.react(emojis[i]);
                    isDefault = true;
                } catch (err) {
                    return reject(
                        global.t.trans(
                            ['error.admin.reactionroles.emojiNotFound', emojis[i]],
                            guild_id
                        )
                    );
                }
            }
            let role = await main_interaction.bot.guilds.cache
                .get(guild_id)
                .roles.fetch(roles[i])
                .catch(() => {
                    return reject(
                        global.t.trans(
                            ['error.admin.reactionroles.roleDoesntExists', roles[i]],
                            guild_id
                        )
                    );
                });
            if (!role) {
                return reject(
                    global.t.trans(['error.admin.reactionroles.roleNotFound', roles[i]], guild_id)
                );
            }

            if (!isDefault) {
                let emoji = await main_interaction.bot.guilds.cache
                    .get(guild_id)
                    .emojis.fetch(emojis[i])
                    .catch((err) => {
                        return reject(
                            global.t.trans(
                                ['error.admin.reactionroles.emojiDoesntExists', emojis[i]],
                                guild_id
                            )
                        );
                    });

                if (!emoji) {
                    return reject(
                        global.t.trans(
                            ['error.admin.reactionroles.emojiNotFound', emojis[i]],
                            guild_id
                        )
                    );
                }
            }
        }

        const guildConfig = await new GuildConfig().get(guild_id);
        const reactionroles = guildConfig.reactionroles || [];

        if (reactionroles.length >= 5) {
            return reject(global.t.trans(['error.admin.reactionroles.maxRoles', 5], guild_id));
        }

        if (reactionroles.length > 0) {
            for (let i in reactionroles) {
                if (reactionroles[i].messageId == messageId) {
                    reactionroles.splice(i, 1);
                }
            }
        }

        const newReactionRoles = {
            messageId: messageId,
            channel: channel,
            roles: [],
        };

        for (let i in roles) {
            newReactionRoles.roles.push({
                role: roles[i],
                emoji: emojis[i],
            });
        }

        reactionroles.push(newReactionRoles);

        return await new GuildConfig()
            .update({
                guild_id,
                value: reactionroles,
                valueName: 'reactionroles',
            })
            .then(async (res) => {
                await message.reactions.removeAll().catch(() => {
                    return reject(
                        global.t.trans(['error.permissions.bot.manageReactions'], guild_id)
                    );
                });

                for (let i = 0; i < length; i++) {
                    await message.react(`${emojis[i]}`).catch(() => {
                        return reject(
                            global.t.trans(['error.permissions.bot.manageReactions'], guild_id)
                        );
                    });
                }

                resolve(global.t.trans(['success.admin.reactionroles.updated'], guild_id));
            })
            .catch((err) => {
                reject(global.t.trans(['error.general'], guild_id));
            });
    });
};

module.exports.removeReactionRoles = async ({ guild_id, message_link, main_interaction }) => {
    return new Promise(async (resolve, reject) => {
        const messageLink = message_link.split('/');
        const channel = messageLink[messageLink.length - 2];
        const messageId = messageLink[messageLink.length - 1];

        if (!messageLink || !channel || !messageId) {
            return reject(
                global.t.trans(['error.admin.reactionroles.messageLinkNotValid'], guild_id)
            );
        }

        const message = await main_interaction.bot.guilds.cache
            .get(guild_id)
            .channels.cache.get(channel)
            .messages.fetch(messageId);

        if (!message) {
            return reject(global.t.trans(['error.admin.reactionroles.messageNotFound'], guild_id));
        }

        const guildConfig = await new GuildConfig().get(guild_id);
        const reactionroles = guildConfig.reactionroles;

        if (reactionroles.length > 0) {
            for (let i in reactionroles) {
                if (reactionroles[i].messageId == messageId) {
                    reactionroles.splice(i, 1);
                }
            }
        }

        return await new GuildConfig()
            .update({
                guild_id,
                value: reactionroles,
                valueName: 'reactionroles',
            })
            .then(async (res) => {
                await message.reactions
                    .removeAll()
                    .then(() => {
                        resolve(global.t.trans(['success.admin.reactionroles.removed'], guild_id));
                    })
                    .catch(() => {
                        return reject(
                            global.t.trans(['error.permissions.bot.manageReactions'], guild_id)
                        );
                    });
            })
            .catch((err) => {
                reject(global.t.trans(['error.general'], guild_id));
            });
    });
};

module.exports.handleAddedReactions = async ({ reaction, user, bot, remove }) => {
    if (user.bot || user.system) return;
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }

    const guild = bot.guilds.cache.get(reaction.message.guildId);
    const guildConfig = await new GuildConfig().get(guild.id);
    const reactionroles = guildConfig.reactionroles;

    for (let i in reactionroles) {
        if (reactionroles[i].messageId === reaction.message.id) {
            for (let e in reactionroles[i].roles) {
                let emoji = reactionroles[i].roles[e].emoji;

                if (emoji === reaction.emoji.id || emoji === reaction.emoji.name) {
                    if (
                        guild.roles.cache.find((role) => role.id === reactionroles[i].roles[e].role)
                    ) {
                        if (remove) {
                            try {
                                return guild.members.cache
                                    .get(user.id)
                                    .roles.remove(reactionroles[i].roles[e].role);
                            } catch (err) {}
                        } else {
                            try {
                                return guild.members.cache
                                    .get(user.id)
                                    .roles.add(reactionroles[i].roles[e].role);
                            } catch (err) {}
                        }
                    }
                }
            }
        }
    }
};

module.exports.viewAllReactionRoles = (guild_id) => {
    return new Promise(async (resolve, reject) => {
        const guildConfig = await new GuildConfig().get(guild_id);
        const reactionroles = guildConfig.reactionroles;

        if (reactionroles.length === 0) {
            return reject(
                global.t.trans(['error.admin.reactionroles.noReactionRolesInServer'], guild_id)
            );
        }

        let embed = new EmbedBuilder()
            .setColor(global.t.trans(['general.colors.info']))
            .setTitle('Reaction Roles')
            .setTimestamp();

        for (let i in reactionroles) {
            let roles = '';
            for (let e in reactionroles[i].roles) {
                roles += `<@&${reactionroles[i].roles[e].role}> `;
            }

            embed.addFields({
                name: `Message: ${reactionroles[i].messageId}`,
                value: `Channel: <#${reactionroles[i].channel}>

                Emotes: ${reactionroles[i].roles.map((r) => r.emoji).join(' ')}
                Roles: ${roles}`,
                inline: false,
            });
        }

        resolve(embed);
    });
};
