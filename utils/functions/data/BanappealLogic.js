const { ButtonBuilder } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const { ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class BanappealLogic {
    constructor() {}

    sendBanappealToUser(guild_id, user_id) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.getSettings(guild_id);
            if (!settings) {
                return reject(false);
            }

            const user = await this.bot.users.fetch(user_id);
            if (!user) {
                return reject(false);
            }

            const guild = await this.bot.guilds.fetch(guild_id);
            if (!guild) {
                return reject(false);
            }

            settings.title = settings.title.replace(
                '{user}',
                `${user.username}#${user.discriminator}`
            );
            settings.description = settings.description.replace(
                '{user}',
                `${user.username}#${user.discriminator}`
            );

            settings.title = settings.title.replace('{guild}', guild.name);
            settings.description = settings.description.replace('{guild}', guild.name);

            for (let i in settings.questions) {
                settings.questions[i] = settings.questions[i].replace(
                    '{user}',
                    `${user.username}#${user.discriminator}`
                );
                settings.questions[i] = settings.questions[i].replace('{guild}', guild.name);
            }

            const title = settings.title;
            const description = settings.description;
            const questions = settings.questions;

            const embed = new EmbedBuilder().setTitle(title).setDescription(description);

            for (let i in questions) {
                embed.addFields({
                    name: `Question ${parseInt(i) + 1}`,
                    value: questions[i],
                });
            }

            await user
                .send({
                    content: `||${guild_id}|| ‼️ Please fill the answers to the questions below in **ONE** Message and **REPLY** to the bots Message, or the bot can't see for which Guild you are requesting the unban. The Bot will send the first message you send.`,
                    embeds: [embed],
                })
                .catch((err) => {
                    // User has DMs disabled
                    reject(false);
                })
                .finally(() => {
                    resolve(true);
                });
        });
    }

    getBanAppealMessage(message) {
        return new Promise(async (resolve, reject) => {
            const fetchedMessage = await this.bot.channels
                .fetch(message.reference.channelId)
                .then((channel) => {
                    return channel.messages.fetch(message.reference.messageId);
                })
                .catch((err) => {
                    return false;
                });

            if (!fetchedMessage) {
                return reject(false);
            }

            const guild_id = fetchedMessage.content.split('||')[1];
            if (!guild_id) {
                return reject(false);
            }

            resolve(guild_id);
        });
    }

    sendAppealToAdmins(guild_id, user_id) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.getSettings(guild_id);
            if (!settings || !settings.length === 0) {
                return reject('No settings found for this Guild');
            }

            const guild = await this.bot.guilds.fetch(guild_id);
            if (!guild) {
                return reject('No Guild found for this ID');
            }

            const banappeal = await this.getBanappeal(guild_id, user_id);
            if (!banappeal) {
                return reject('No Banappeal found for this User');
            }

            const user = await this.bot.users.fetch(user_id);

            const answers = banappeal.appeal_msg;

            const embed = new EmbedBuilder()
                .setTitle(
                    `New Banappeal from ${
                        user ? `${user.username}#${user.discriminator}` : `${user_id}`
                    }`
                )
                .setColor('#ff0000');
            if (user) {
                embed.setThumbnail(user.displayAvatarURL());
            }

            embed.addFields({
                name: `Answer:`,
                value: `${answers}`,
            });

            const acceptbtn = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept')
                .setCustomId(`banappeal_accept_${banappeal.id}`);

            const denybtn = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Deny')
                .setCustomId(`banappeal_deny_${banappeal.id}`);

            const channel = await this.bot.channels.fetch(settings.channel_id);
            await channel
                .send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents([acceptbtn, denybtn])],
                })
                .catch((err) => {
                    // The channel is not available or the bot does not have permissions to send messages
                });

            resolve(true);
        });
    }

    cleanUserInput(message) {
        // remove all suspicious characters from the message to prevent SQL injections
        return message.replace(/[^a-zA-Z0-9 ]/g, '');
    }

    manageBanappeal(main_interaction) {
        return new Promise(async (resolve, reject) => {
            const banappealid = main_interaction.customId.split('_')[2];
            const isAccepted = main_interaction.customId.split('_')[1] === 'accept' ? true : false;

            const banappeal = await this.getBanappeal(null, null, banappealid);
            if (!banappeal) {
                return reject(false);
            }

            if (banappeal.isAccepted !== null && banappeal.isAccepted !== undefined) {
                return main_interaction
                    .reply({
                        content: `This Banappeal was already ${
                            banappeal.isAccepted ? 'accepted' : 'denied'
                        }`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }

            const guild = await this.bot.guilds.fetch(banappeal.guild_id);
            if (!guild) {
                return reject(false);
            }

            guild.members
                .unban(banappeal.user_id)
                .then(async () => {
                    // The user is unbanned
                    const user = await this.bot.users.fetch(banappeal.user_id);
                    user.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `Your Banappeal was ${isAccepted ? 'accepted' : 'denied'}`
                                )
                                .setDescription(
                                    `Your Banappeal was ${
                                        isAccepted ? 'accepted' : 'denied'
                                    } by the Admins. ${
                                        isAccepted
                                            ? `You are now unbanned from the ${guild.name}`
                                            : ''
                                    }.`
                                )
                                .setColor('#00ff00'),
                        ],
                    }).catch((err) => {});
                })
                .catch((err) => {
                    return main_interaction
                        .reply({
                            content: `${
                                err.code === 10026
                                    ? 'The user is not banned.'
                                    : err.code === 50013
                                    ? 'The bot does not have permissions to unban the user.'
                                    : 'There was an error while trying to unban the user.'
                            }`,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });

            await this.updateBanappeal(guild.id, banappeal.user_id, isAccepted, 'isAccepted')
                .then(() => {
                    main_interaction
                        .update({
                            content: `The ban appeal was ${
                                isAccepted ? 'accepted' : 'denied'
                            } successfully.`,
                            components: [],
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: `An error occured: ${err}`,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            resolve(true);
        });
    }

    isOverCooldown(banappealid) {
        return new Promise(async (resolve, reject) => {
            const banappeal = await this.getBanappeal(null, null, banappealid);
            if (!banappeal) {
                return reject(false);
            }

            const cooldown = banappeal.cooldown;
            const now = new Date();

            if (cooldown === null || cooldown === undefined) {
                return resolve(false);
            }

            resolve(now.getTime() <= cooldown.getTime());
        });
    }
};
