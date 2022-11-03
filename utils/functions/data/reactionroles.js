const { removeMention, removeEmojiTags } = require('../removeCharacters');
const { updateGuildConfig, GuildConfig } = require('./Config');

module.exports.updateReactionRoles = async ({
    guild_id,
    message_id,
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

        const messageId = message_id;

        if (!channel || !messageId) {
            return reject('❌ The message link is not valid');
        }

        const message = await main_interaction.bot.guilds.cache
            .get(guild_id)
            .channels.cache.get(channel)
            .messages.fetch(messageId);

        if (!message) {
            return reject('❌ The message does not exist');
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
                .catch((err) => {
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
                        return reject(`❌ The emoji ${emojis[i]} does not exist.`);
                    });

                if (!emoji) {
                    return reject(`❌<:${emojis[i]}> not found in this guild.`);
                }
            }
        }

        const guildConfig = await GuildConfig.get(guild_id);
        const reactionroles = guildConfig.reactionroles;

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
                emoji: isNaN(emojis[i]) ? emojis[i].codePointAt(0) : emojis[i],
            });
        }

        reactionroles.push(newReactionRoles);

        return await updateGuildConfig({
            guild_id,
            value: JSON.stringify(reactionroles),
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
                var emoji;
                try {
                    emoji = String.fromCodePoint(reactionroles[i].roles[e].emoji);
                } catch (err) {
                    emoji = reactionroles[i].roles[e].emoji;
                }

                if (emoji === reaction.emoji.id || emoji === reaction.emoji.name) {
                    if (
                        guild.roles.cache.find((role) => role.id === reactionroles[i].roles[e].role)
                    ) {
                        if (remove) {
                            return guild.members.cache
                                .get(user.id)
                                .roles.remove(reactionroles[i].roles[e].role)
                                .catch((err) => {});
                        } else {
                            return guild.members.cache
                                .get(user.id)
                                .roles.add(reactionroles[i].roles[e].role)
                                .catch((err) => {});
                        }
                    }
                }
            }
        }
    }
};
