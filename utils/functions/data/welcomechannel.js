const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, Embed } = require('discord.js');
const { delay } = require('../delay');
const isURI = require('@stdlib/assert-is-uri');
const { isValidHexCode } = require('../validate/isValidHexCode');
const { validateCustomStrings } = require('../validate/validateCustomStrings');
const GuildConfig = require('~utils/classes/Config');
const { defaultWelcomeMessage } = require('./variables');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.updateWelcomeSettings = async ({ guild_id, valueName, value, remove = false }) => {
    return new Promise(async (resolve, reject) => {
        let welcomeSettings = await this.getWelcomechannel({
            guild_id,
        });

        if (remove) {
            welcomeSettings = null;
        } else {
            welcomeSettings[valueName] = value;
        }

        return await new GuildConfig()
            .update({
                guild_id,
                value: welcomeSettings,
                valueName: 'welcome_channel',
            })
            .then(() => {
                resolve(true);
            })
            .catch(() => {
                reject(false);
            });
    });
};

//=========================================================

module.exports.getWelcomechannel = async ({ guild_id }) => {
    const guildConfig = await new GuildConfig().get(guild_id);
    return guildConfig && guildConfig.welcome_channel
        ? guildConfig.welcome_channel
        : defaultWelcomeMessage;
};

//=========================================================

module.exports.manageNewWelcomeSetting = async ({ main_interaction }) => {
    return new Promise(async (resolve, reject) => {
        main_interaction.values = main_interaction.values[0];

        const value = main_interaction.values.split('_')[0];
        const guild_id = main_interaction.values.split('_')[1];

        if (value === 'save') {
            try {
                Promise.all([
                    await this.sendWelcomeMessage(
                        {
                            guild_id,
                            bot: main_interaction.bot,
                            joined_user: main_interaction.member,
                        },
                        true
                    ),
                    await this.updateWelcomeSettings({
                        guild_id,
                        valueName: 'active',
                        value: true,
                    }),
                ]).then(async (res) => {
                    await delay(1000);
                    res[0].delete().catch(() => {});
                    await main_interaction.message.react('✅').catch((err) => {});
                });
            } catch (err) {
                await main_interaction.channel
                    .send({
                        embeds: [
                            new EmbedBuilder().setDescription(
                                `Something went wrong while saving the welcome settings. Please try again later. Error: \`${err}\``
                            ),
                        ],
                    })
                    .catch((err) => {});
                reject(err);
            }

            return resolve(true);
        }

        const sentMessage = await main_interaction.channel.send(
            "🔎 Please add the content for your choosen setting. ||`cancel` stops the current collector, `clear` will clear the current option to ''||"
        );

        const collector = main_interaction.message.channel.createMessageCollector({
            max: 1,
            time: 120000,
            filter: (user) => user.author.id === main_interaction.user.id,
        });

        const data = {};

        collector.on('collect', async (message) => {
            let isClear = false;

            if (message.content.toLowerCase() === 'cancel') {
                message.delete().catch((err) => {});
                collector.stop();
                return;
            } else if (message.content.toLowerCase() === 'clear') {
                isClear = true;
                data[value] = '';
            }

            data[value] = message.content;
            message.delete().catch(() => {});

            const messageEmbed = main_interaction.message.embeds[0].data;
            switch (value) {
                case 'message': {
                    let newMessage;
                    if (!isClear) {
                        const array = main_interaction.message.content.split(' ');
                        const index = array.indexOf('Message:');
                        newMessage =
                            array.splice(0, index + 1).join(' ') + ' \n **' + data[value] + '**';
                    }
                    main_interaction.message.content = newMessage || '';
                    break;
                }
                case 'author':
                    messageEmbed.author.name = isClear ? '' : data[value];
                    break;
                case 'title':
                    messageEmbed.title = isClear ? '' : data[value];
                    break;
                case 'description':
                    messageEmbed.description = isClear ? '' : data[value];
                    break;
                case 'thumbnail':
                    if (isClear) {
                        messageEmbed.thumbnail = '';
                        break;
                    }
                    if (
                        (isURI(data[value]) && data[value].endsWith('jpg')) ||
                        data[value].endsWith('png') ||
                        data[value] === '{pfp}'
                    ) {
                        if (data[value] !== '{pfp}') {
                            if (
                                data[value].search('http://') === -1 &&
                                data[value].search('https://') === -1
                            )
                                data[value] = 'https://' + data[value];
                        }
                        if (!messageEmbed.thumbnail) messageEmbed.thumbnail = {};
                        messageEmbed.thumbnail.url = validateCustomStrings({
                            string: data[value],
                            joined_user: main_interaction,
                        });
                    }
                    break;
                case 'url':
                    if (isClear) {
                        messageEmbed.url = '';
                        break;
                    }
                    if (isURI(data[value])) {
                        if (
                            data[value].search('http://') === -1 &&
                            data[value].search('https://') === -1
                        )
                            data[value] = 'https://' + data[value];

                        messageEmbed.url = isClear ? '' : data[value];
                    }
                    break;
                case 'color':
                    if (isValidHexCode(data[value])) {
                        messageEmbed.color = data[value];
                    }
                    break;
                case 'image':
                    if (isClear) {
                        messageEmbed.image = '';
                        break;
                    }
                    if (data[value] === '{pfp}') {
                        if (!messageEmbed.image) messageEmbed.image = {};
                        messageEmbed.image.url = validateCustomStrings({
                            string: data[value],
                            joined_user: main_interaction,
                        });
                        break;
                    }
                    if (
                        (isURI(data[value]) && data[value].endsWith('jpg')) ||
                        data[value].endsWith('png') ||
                        data[value].endsWith('jpeg') ||
                        data[value].endsWith('gif')
                    ) {
                        if (
                            data[value].search('http://') === -1 &&
                            data[value].search('https://') === -1
                        )
                            data[value] = 'https://' + data[value];

                        if (!messageEmbed.image) messageEmbed.image = {};
                        messageEmbed.image.url = data[value];
                    }
                    break;
                case 'footer':
                    messageEmbed.footer.text = isClear ? '' : data[value];
                    break;
            }

            await this.updateWelcomeSettings({
                guild_id,
                valueName: value,
                value: data[value],
            })
                .then(async () => {
                    const editEmbed = new EmbedBuilder()
                        .setColor(messageEmbed.color)
                        .setAuthor({
                            name: messageEmbed.author.name,
                        })
                        .setTitle(messageEmbed.title)
                        .setURL(messageEmbed.url)
                        .setDescription(messageEmbed.description || '')

                        .addFields([
                            {
                                name: 'This is an example field name',
                                value: 'This is an example field value',
                            },
                        ])

                        .setFooter({
                            text: messageEmbed.footer.text,
                        })
                        .setTimestamp();

                    if (messageEmbed.thumbnail) {
                        editEmbed.setThumbnail(messageEmbed.thumbnail.url);
                    }

                    if (messageEmbed.image) {
                        editEmbed.setImage(messageEmbed.image.url);
                    }

                    await main_interaction.message
                        .edit({
                            content: main_interaction.message.content,
                            embeds: [editEmbed],
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    reject(err);
                });
            collector.stop();
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                sentMessage.edit('Timed out.');
                await delay(10000);
            }
            sentMessage.delete();
        });
    });
};

module.exports.sendWelcomeSetting = async ({ main_interaction }) => {
    return new Promise(async (resolve, reject) => {
        const welcomeChannel = await this.getWelcomechannel({
            guild_id: main_interaction.guild.id,
        });

        const exampleEmbed = new EmbedBuilder()
            .setColor(welcomeChannel.color || '#0099ff')
            .setAuthor({
                name: welcomeChannel.author || main_interaction.user.username,
            })
            .setTitle(welcomeChannel.title || 'This is an example title')
            .setURL(welcomeChannel.url || 'https://www.youtube.com/watch?v=d1YBv2mWll0')
            .setDescription(welcomeChannel.description || 'This is an example description')
            .addFields([
                {
                    name: 'This is an example field name',
                    value: 'This is an example field value',
                },
            ])
            .setImage(
                welcomeChannel.image || 'https://cdn.boop.pl/uploads/2021/05/E1LVzWfWQAMbRiA.jpg'
            )
            .setFooter({
                text: welcomeChannel.footer || 'This is an example footer',
            })
            .setTimestamp();

        if (welcomeChannel.thumbnail === '{pfp}') {
            exampleEmbed.setThumbnail(
                main_interaction.user.avatarURL({
                    format: 'jpg',
                })
            );
        } else {
            exampleEmbed.setThumbnail(
                welcomeChannel.thumbnail ||
                    'https://cdn.boop.pl/uploads/2021/05/E1LVzWfWQAMbRiA.jpg'
            );
        }

        //=========================================================//

        const menu = new StringSelectMenuBuilder()
            .setCustomId('welcomemessage')
            .setPlaceholder('Choose an option.');

        menu.addOptions([
            {
                value: `message_${main_interaction.guild.id}`,
                label: 'Message over of the embed',
            },
        ]);

        menu.addOptions([
            {
                value: `author_${main_interaction.guild.id}`,
                label: 'Author at the top of the embed',
            },
        ]);

        menu.addOptions([
            {
                value: `color_${main_interaction.guild.id}`,
                label: 'Set the color for your embed (#FFFFF)',
            },
        ]);

        menu.addOptions([
            {
                value: `title_${main_interaction.guild.id}`,
                label: 'Title of the embed',
            },
        ]);

        menu.addOptions([
            {
                value: `url_${main_interaction.guild.id}`,
                label: 'Set a URL for the title [LINK ONLY]',
            },
        ]);

        menu.addOptions([
            {
                value: `description_${main_interaction.guild.id}`,
                label: 'Description of the embed',
            },
        ]);

        menu.addOptions([
            {
                value: `thumbnail_${main_interaction.guild.id}`,
                label: 'Set a thumbnail for the embed [LINK ONLY + .jpg/.png]',
            },
        ]);

        // menu.addOptions([{
        //     'value': `field_${main_interaction.guild.id}`,
        //     'label': 'Add a field to the embed'
        // }])

        menu.addOptions([
            {
                value: `image_${main_interaction.guild.id}`,
                label: 'Set an image for the embed [LINK ONLY + .jpg/.png]',
            },
        ]);

        // menu.addOptions([{
        //     'value': `timestamp_${main_interaction.guild.id}`,
        //     'label': 'Activate or deactivate the timestamp'
        // }])

        menu.addOptions([
            {
                value: `save_${main_interaction.guild.id}`,
                label: 'Save the current embed and activate it.',
            },
        ]);

        await main_interaction.channel
            .send({
                content: `Please select the options you want to edit. (The example texts wont be saved!!!) \n
**{name}** = Username of the new person 
**{pfp}** = Profile picture of the new person
**{mention}** = Mentioned the user 
**{guild}** = Name of the guild 
**{count}** = Member Count (including bots & the new user)
\`#channel\` = A tagged channel
\`@role\` = A tagged role
**{everyone}** = Tags everyone in the guild 
**{here}** = Tags everyone who are online in the guild 
\n\n Your Message: \n${'**' + welcomeChannel.message + '**' || '_not set yet_'}
            `,
                embeds: [exampleEmbed],
                components: [
                    new ActionRowBuilder({
                        components: [menu],
                    }),
                ],
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports.sendWelcomeMessage = async ({ guild_id, bot, joined_user }, isTest = false) => {
    return new Promise(async (resolve, reject) => {
        const welcomeChannel = await this.getWelcomechannel({
            guild_id,
        });
        if (!welcomeChannel.active && !isTest) return;
        if (!welcomeChannel.id) return reject(`No welcome channel set for ${guild_id}`);

        if (welcomeChannel.color) {
            const validColor = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');
            if (!validColor.test(welcomeChannel.color)) {
                welcomeChannel.color = '#0099ff';
            }
        }

        if (welcomeChannel.url) {
            if (!isURI(welcomeChannel.url)) {
                welcomeChannel.url = null;
            }
        }

        let welcomeMessage;
        try {
            welcomeMessage = new EmbedBuilder()
                .setColor(welcomeChannel.color || null)
                .setAuthor({
                    name: validateCustomStrings({
                        string: welcomeChannel.author,
                        joined_user,
                    }),
                })
                .setTitle(
                    validateCustomStrings({
                        string: welcomeChannel.title,
                        joined_user,
                    })
                )
                .setURL(welcomeChannel.url)
                .setDescription(
                    validateCustomStrings({
                        string: welcomeChannel.description,
                        joined_user,
                    })
                )
                .setImage(
                    validateCustomStrings({
                        string: welcomeChannel.image,
                        joined_user,
                    })
                )
                .setThumbnail(
                    validateCustomStrings({
                        string: welcomeChannel.thumbnail,
                        joined_user,
                    })
                )
                .setTimestamp();
        } catch (err) {
            // some value is not valid
            return reject(err);
        }

        const cleanedMessage = validateCustomStrings({
            string: welcomeChannel.message,
            joined_user,
        });

        let sendObject = {};
        if (welcomeChannel instanceof Embed) {
            sendObject = {
                content: cleanedMessage,
                embeds: [welcomeChannel],
            };
        } else {
            sendObject = {
                content: cleanedMessage,
            };
        }

        return await bot.guilds.cache
            .get(guild_id)
            .channels.cache.get(welcomeChannel.id)
            .send(sendObject)
            .then((msg) => {
                errorhandler({
                    message: `✅ I have successfully send a welcome message in Guild: ${joined_user.guild.id}`,
                    fatal: false,
                    id: 1694433443,
                });
                resolve(msg);
            })
            .catch(async (err) => {
                errorhandler({
                    message: `❌ I have failed to send a welcome message in Guild: ${joined_user.guild.id} - ${err.message}`,
                    fatal: false,
                    id: 1694433448,
                });
                reject(err);
            });
    });
};
