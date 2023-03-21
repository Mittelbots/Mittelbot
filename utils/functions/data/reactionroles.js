const { EmbedBuilder } = require('discord.js');
const { removeMention, removeEmojiTags } = require('../removeCharacters');
const { GuildConfig } = require('./Config');

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
            return reject('❌ The number of roles and emojis must be equal');
        }

        const messageLink = message_link.split('/');
        const channel = messageLink[messageLink.length - 2];
        const messageId = messageLink[messageLink.length - 1];

        if (!messageLink || !channel || !messageId) {
            return reject('❌ The message link is not valid');
        }

        const message = await main_interaction.bot.guilds.cache
            .get(guild_id)
            .channels.cache.get(channel)
            .messages.fetch(messageId);

        if (!message) {
            return reject('❌ The message does not exist. Please check the link.');
        }

        for (let i in roles) {
            let isDefault = false;
            if (isNaN(emojis[i])) {
                try {
                    message.react(emojis[i]);
                    isDefault = true;
                } catch (err) {
                    return reject(`❌<:&${emojis[i]}> not found in this guild.`);
                }
            }
            let role = await main_interaction.bot.guilds.cache
                .get(guild_id)
                .roles.fetch(roles[i])
                .catch(() => {
                    return reject(`❌ The role ${roles[i]} does not exist.`);
                });
            if (!role) {
                return reject(`❌< @&${roles[i]}> not found in this guild.`);
            }

            if (!isDefault) {
                let emoji = await main_interaction.bot.guilds.cache
                    .get(guild_id)
                    .emojis.fetch(emojis[i])
                    .catch((err) => {
                        return reject(
                            `❌ The emoji <:emote:${emojis[i]}> does not exist in this Server.`
                        );
                    });

                if (!emoji) {
                    return reject(`❌<:${emojis[i]}> not found in this guild.`);
                }
            }
        }

        const guildConfig = await GuildConfig.get(guild_id);
        const reactionroles = guildConfig.reactionroles || [];

        if (reactionroles.length >= 5) {
            return reject('❌ You can only have up to 5 reaction roles.');
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

        return await GuildConfig.update({
            guild_id,
            value: reactionroles,
            valueName: 'reactionroles',
        })
            .then(async (res) => {
                await message.reactions.removeAll().catch(() => {
                    return reject(
                        `❌ I dont have permissions to remove the reactions from the message.`
                    );
                });

                for (let i = 0; i < length; i++) {
                    await message.react(`${emojis[i]}`).catch(() => {
                        return reject('❌ I do not have the permission to react to this message');
                    });
                }

                resolve(`✅ The reaction roles have been updated.`);
            })
            .catch((err) => {
                reject(`❌ There was an error updating the reaction roles.`);
            });
    });
};

module.exports.removeReactionRoles = async ({ guild_id, message_link, main_interaction }) => {
    return new Promise(async (resolve, reject) => {
        const messageLink = message_link.split('/');
        const channel = messageLink[messageLink.length - 2];
        const messageId = messageLink[messageLink.length - 1];

        if (!messageLink || !channel || !messageId) {
            return reject('❌ The message link is not valid');
        }

        const message = await main_interaction.bot.guilds.cache
            .get(guild_id)
            .channels.cache.get(channel)
            .messages.fetch(messageId);

        if (!message) {
            return reject('❌ The message does not exist');
        }

        const guildConfig = await GuildConfig.get(guild_id);
        const reactionroles = guildConfig.reactionroles;

        if (reactionroles.length > 0) {
            for (let i in reactionroles) {
                if (reactionroles[i].messageId == messageId) {
                    reactionroles.splice(i, 1);
                }
            }
        }

        return await GuildConfig.update({
            guild_id,
            value: reactionroles,
            valueName: 'reactionroles',
        })
            .then(async (res) => {
                await message.reactions
                    .removeAll()
                    .then(() => {
                        resolve(`✅ The reaction roles have been removed.`);
                    })
                    .catch(() => {
                        return reject(
                            `❌ I dont have permissions to remove the reactions from the message. ✅ But the reaction roles have been removed from the database.`
                        );
                    });
            })
            .catch((err) => {
                reject(`❌ There was an error updating the reaction roles.`);
            });
    });
};

module.exports.handleAddedReactions = async ({ reaction, user, bot, remove }) => {
    if (user.bot || user.system) return;
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    const guild = bot.guilds.cache.get(reaction.message.guildId);
    const guildConfig = await GuildConfig.get(guild.id);
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
        const guildConfig = await GuildConfig.get(guild_id);
        const reactionroles = guildConfig.reactionroles;

        if (reactionroles.length === 0) {
            return reject('❌ There are no reaction roles in this server.');
        }

        let embed = new EmbedBuilder()
            .setColor('#0099ff')
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
