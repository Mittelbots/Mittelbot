const {
    removeMention,
    removeEmojiTags
} = require("../removeCharacters");
const {
    getGuildConfig,
    updateGuildConfig
} = require("./getConfig");

module.exports.updateReactionRoles = async ({
    guild_id,
    message_link,
    roles,
    emojis,
    main_interaction
}) => {
    return new Promise(async (resolve, reject) => {
        roles = removeMention(roles).split(' ');
        emojis = emojis.split(' ');

        let length = roles.length;

        for (let i in emojis) {
            emojis[i] = removeEmojiTags(emojis[i]);
        }

        console.log(emojis)

        if (roles.length !== emojis.length) {
            reject('❌ The number of roles and emojis must be equal');
        }

        for (let i in roles) {
            let role = main_interaction.bot.guilds.cache.get(guild_id).roles.cache.find(role => role.id === roles[i]);
            if (!role) {
                return reject(`❌< @&${roles[i]}> not found in this guild.`);
            }

            let emoji = main_interaction.bot.guilds.cache.get(guild_id).emojis.cache.find(emoji => emoji.id === emojis[i]);
            if (!emoji) {
                return reject(`❌<:${emojis[i]}> not found in this guild.`);
            }
        }

        const channel = message_link.split('/')[5];
        const messageId = message_link.split('/')[6];

        if (!channel || !messageId) {
            return reject('❌ The message link is not valid');
        }

        const message = await main_interaction.bot.guilds.cache.get(guild_id).channels.cache.get(channel).messages.fetch(messageId);

        if (!message) {
            return reject('❌ The message does not exist');
        }

        message.reactions.removeAll().catch(err => {
            return reject(`❌ I dont have permissions to remove the reactions from the message.`);
        })

        for (let i = 0; i < length; i++) {
            message.react(`${emojis[i]}`)
                .catch(() => {
                    return reject('❌ I do not have the permission to react to this message');
                })
        }

        const config = await getGuildConfig({
            guild_id
        });
        var reactionroles = config.settings.reactionroles;

        try {
            reactionroles = JSON.parse(reactionroles);
        } catch (e) {}

        if (!reactionroles) reactionroles = [];

        if (reactionroles.length > 0) {

            for (let i in reactionroles) {
                if (reactionroles[i].channel === channel && reactionroles[i].message === messageId) {
                    reactionroles.splice(i, 1);
                }
            }

        }

        for (let i in roles) {
            reactionroles.push({
                role: roles[i],
                emoji: emojis[i],
                channel: channel,
                messageId: messageId
            });
        }

        return await updateGuildConfig({
            guild_id,
            value: JSON.stringify(reactionroles),
            valueName: 'reactionroles'
        }).then(res => {
            resolve(`✅ The reaction roles have been updated.`);
        }).catch(err => {
            reject(`❌ There was an error updating the reaction roles.`);
        })
    })
}

module.exports.handleAddedReactions = async ({
    reaction,
    user,
    bot,
    remove
}) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    const guild = bot.guilds.cache.get(reaction.message.guildId);

    const config = await getGuildConfig({
        guild_id: guild.id
    });

    var reactionroles = config.settings.reactionroles;

    try {
        reactionroles = JSON.parse(reactionroles);
    } catch (e) {}

    if (!reactionroles) return;

    for (let i in reactionroles) {
        if (reactionroles[i].channel === reaction.message.channelId && reactionroles[i].messageId === reaction.message.id) {
            if (reactionroles[i].emoji === reaction.emoji.id) {
                if (guild.roles.cache.find(role => role.id === reactionroles[i].role)) {
                    if (remove) {
                        return guild.members.cache.get(user.id).roles.remove(reactionroles[i].role).catch(err => {});
                    } else {
                        return guild.members.cache.get(user.id).roles.add(reactionroles[i].role).catch(err => {});
                    }
                }
            }
        }
    }
}