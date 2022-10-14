const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const database = require('../../../src/db/db');
const { applyforms } = require('../cache/cache');
const { errorhandler } = require('../errorhandler/errorhandler');
const { removeMention } = require('../removeCharacters');
const { isValidHexCode } = require('../validate/isValidHexCode');
const { validURL } = require('../validate/isValidURL');

module.exports.getAllForms = async () => {
    return await database
        .query('SELECT apply_form FROM guild_config')
        .then((res) => {
            if (res[0].length === 0) return [];

            let response = [];
            for (let i in res) {
                if (!res[i].apply_form) continue;

                res[i].apply_form = JSON.parse(res[i].apply_form);
                const obj = {
                    guild_id: res[i].apply_form[0].guild_id,
                    forms: res[i].apply_form,
                };
                response.push(obj);
            }
            return response;
        })
        .catch((err) => {
            errorhandler(err);
        });
};

module.exports.getFormByGuild = async ({ guild_id }) => {
    let cache;
    for (let i in applyforms) {
        if (applyforms[i].id === guild_id) {
            return (cache = applyforms[i].forms);
        }
    }

    if (cache) return cache;

    return await database
        .query('SELECT apply_form FROM guild_config WHERE guild_id = ?', [guild_id])
        .then((res) => {
            if (!res[0].apply_form) return false;
            return JSON.parse(res[0].apply_form);
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
            return false;
        });
};

module.exports.getFormById = async ({ guild_id, apply_id }) => {
    for (let i in applyforms) {
        if (applyforms[i].id === guild_id) {
            for (let x in applyforms[i].forms) {
                if (applyforms[i].forms[x].id === apply_id) {
                    return {
                        error: false,
                        apply: applyforms[i].forms[x],
                    };
                }
            }
        }
    }

    return await database
        .query('SELECT apply_form FROM guild_config WHERE guild_id = ?', [guild_id])
        .then((res) => {
            let apply = false;
            res[0].apply_form = JSON.parse(res[0].apply_form);
            for (let i in res[0].apply_form) {
                if (res[0].apply_form[i].id == apply_id) {
                    apply = res[0].apply_form[i];
                }
            }
            return {
                error: false,
                apply: apply,
            };
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
            return {
                error: true,
                apply: false,
            };
        });
};

module.exports.gernerateApplyId = (guild_id) => {
    const newApplyId = Math.floor(Math.random() * 20 * 2000);

    const exist = this.getFormById({
        guild_id,
        apply_id: newApplyId,
    });

    if (exist.error) return exist;

    if (exist.apply) this.gernerateApplyId(guild_id);
    else return newApplyId;
};

module.exports.sendApplyForm = async ({ apply_id, main_interaction }) => {
    return new Promise(async (resolve, reject) => {
        var applyForm = await this.getFormById({
            guild_id: main_interaction.guild.id,
            apply_id,
        });

        if (applyForm.error) return reject('❌ Something went wrong.');

        applyForm = applyForm.apply;

        const channel = main_interaction.bot.guilds.cache
            .get(main_interaction.guild.id)
            .channels.cache.get(applyForm.channel);
        const isActive = applyForm.active;

        if (channel && isActive) {
            const applyEmbed = new EmbedBuilder();

            if (applyForm.title) applyEmbed.setTitle(applyForm.title);
            if (applyForm.description) applyEmbed.setDescription(applyForm.description);
            if (applyForm.color) applyEmbed.setColor(applyForm.color);
            if (applyForm.field1)
                applyEmbed.addFields([
                    { name: applyForm.field1.name, value: applyForm.field1.value },
                ]);
            if (applyForm.field2)
                applyEmbed.addFields([
                    { name: applyForm.field2.name, value: applyForm.field2.value },
                ]);
            if (applyForm.image) applyEmbed.setImage(applyForm.image);
            if (applyForm.footer)
                applyEmbed.setFooter({
                    text: applyForm.footer,
                });

            var applyButton;
            if (applyForm.applylink) {
                applyButton = new ButtonBuilder()
                    .setLabel('Apply')
                    .setURL(applyForm.applylink)
                    .setStyle(ButtonStyle.Link);
            } else {
                applyButton = new ButtonBuilder({
                    style: ButtonStyle.Success,
                    label: 'Apply',
                    emoji: '📩',
                    customId: `apply_${apply_id}`,
                });
            }
            if (applyForm.messageId) {
                this.editMessage({
                    main_interaction,
                    apply_id,
                    channel,
                    messageId: applyForm.messageId,
                    applyEmbed,
                    applyButton,
                });
            } else {
                this.sendMessage({
                    main_interaction,
                    apply_id,
                    channel,
                    applyEmbed,
                    applyButton,
                });
            }
        }
    });
};

module.exports.editMessage = ({
    main_interaction,
    apply_id,
    channel,
    messageId,
    applyEmbed,
    applyButton,
}) => {
    return new Promise(async (resolve, reject) => {
        channel.messages
            .fetch(messageId)
            .then((message) => {
                message
                    .edit({
                        embeds: [applyEmbed],
                        components: [
                            new ActionRowBuilder({
                                components: [applyButton],
                            }),
                        ],
                    })
                    .then(async (msg) => {
                        this.saveApplyForm({
                            main_interaction,
                            guild_id: main_interaction.guild.id,
                            apply_id,
                            embed_name: 'messageId',
                            content: msg.id,
                        });
                    })
                    .catch((err) => {
                        reject('❌ Something went wrong.');
                        this.sendMessage({
                            main_interaction,
                            apply_id,
                            channel,
                            applyEmbed,
                            applyButton,
                        });
                    });
            })
            .catch((err) => {
                this.sendMessage({
                    main_interaction,
                    apply_id,
                    channel,
                    applyEmbed,
                    applyButton,
                });
            });
    });
};

module.exports.sendMessage = ({ main_interaction, apply_id, channel, applyEmbed, applyButton }) => {
    return new Promise(async (resolve, reject) => {
        channel
            .send({
                content: `||FormId: ${apply_id}||`,
                embeds: [applyEmbed],
                components: [
                    new ActionRowBuilder({
                        components: [applyButton],
                    }),
                ],
            })
            .then(async (msg) => {
                this.saveApplyForm({
                    main_interaction,
                    guild_id: main_interaction.guild.id,
                    apply_id,
                    embed_name: 'messageId',
                    content: msg.id,
                });
                resolve('✅ Welcome Message sent.');
            })
            .catch((err) => {
                channel
                    .send({
                        content: `❌ Something went wrong. I can't send the message. This may be because of the channel permissions or you don't have added the required options.`,
                    })
                    .catch((err) => {
                        main_interaction.react('❌').catch((err) => {});
                    });
            });
    });
};

module.exports.saveApplyForm = async ({
    main_interaction,
    guild_id,
    apply_id,
    embed_name,
    content,
}) => {
    return new Promise(async (resolve, reject) => {
        const exists = await this.getFormByGuild({
            guild_id,
        });

        let res;
        let index;

        if (exists) {
            res = exists;

            for (let i in res) {
                if (res[i].id === apply_id) index = i;
            }

            if (!index) {
                index = res.length;
                res[index] = {};
            }
        } else {
            res = [{}];
            index = 0;
            res[index] = {};
        }

        res[index].guild_id = guild_id;
        res[index].id = apply_id;
        res[index].active = false;

        res[index][embed_name] = content;

        if (embed_name === 'active') {
            if (index - 1 >= 5) {
                return main_interaction.channel
                    .send({
                        content: `You can only have 5 apply forms.`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
        }

        for (let i in applyforms) {
            if (applyforms[i].id === guild_id && applyforms[0].forms[index].id === apply_id) {
                applyforms[0].forms[index][embed_name] = content;
                break;
            }
        }

        await database
            .query(`UPDATE guild_config SET apply_form = ? WHERE guild_id = ?`, [
                JSON.stringify(res),
                guild_id,
            ])
            .then(() => {
                return resolve(`✅ Welcome Message saved. ID: \`${apply_id}\``);
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                return reject(`❌ Something went wrong. ID: \`${apply_id}\``);
            });

        if (embed_name === 'active') {
            if (res[index].channel) {
                this.sendApplyForm({
                    apply_id,
                    main_interaction,
                }).catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                });
            }
        }
    });
};

module.exports.manageNewForm = async ({ main_interaction }) => {
    return new Promise(async (resolve, reject) => {
        main_interaction.values = main_interaction.values[0];

        const value = main_interaction.values.split('_')[0];
        const apply_id = main_interaction.values.split('_')[1];

        if (value === 'save') {
            return await this.saveApplyForm({
                main_interaction,
                guild_id: main_interaction.guild.id,
                apply_id,
                embed_name: 'active',
                content: true,
                messageId: main_interaction.message.id,
            })
                .then((res) => {
                    main_interaction.channel.send(res).catch((err) => {});
                })
                .catch((err) => {
                    main_interaction.channel
                        .send(err)
                        .then(async (msg) => {
                            await delay(2000);
                            await msg.delete();
                        })
                        .catch((err) => {});
                });
        }

        const sentMessage = await main_interaction.channel.send(
            `🔎 Please add the content for your choosen setting. ||\`cancel\` stops the current collector, \`clear\` will clear the current option to ''|| ${
                value.search('field') !== -1
                    ? `\n\n**Note:** If you want to add a field, you have to use the following format (With the **:**!!): \n\n\`yourfield_name:yourfield_value\``
                    : ''
            }`
        );

        const collector = main_interaction.message.channel.createMessageCollector({
            max: 1,
            time: 120000,
            filter: (user) => user.author.id === main_interaction.user.id,
        });

        const data = {};

        collector.on('collect', async (message) => {
            let isClear = false;

            data[value] = message.content;

            if (message.content.toLowerCase() === 'cancel') {
                message.delete().catch((err) => {});
                collector.stop();
                return;
            } else if (message.content.toLowerCase() === 'clear') {
                isClear = true;
                data[value] = '';
            } else {
                pass = true;
            }

            message.delete().catch((err) => {});

            switch (value) {
                case 'apply':
                    this.manageApplication({
                        main_interaction,
                        apply_id,
                    });
                    break;
                case 'title':
                    main_interaction.message.embeds[0].title = isClear ? '' : data[value];
                    break;
                case 'description':
                    main_interaction.message.embeds[0].description = isClear ? '' : data[value];
                    break;
                case 'thumbnail':
                    if (isClear) {
                        main_interaction.message.embeds[0].thumbnail = '';
                        break;
                    }
                    if (
                        (validURL(data[value]) && data[value].endsWith('jpg')) ||
                        data[value].endsWith('png')
                    ) {
                        if (
                            data[value].search('http://') === -1 &&
                            data[value].search('https://') === -1
                        )
                            data[value] = 'https://' + data[value];

                        if (!main_interaction.message.embeds[0].thumbnail)
                            main_interaction.message.embeds[0].thumbnail = {};
                        main_interaction.message.embeds[0].thumbnail.url = data[value];
                    }
                    break;
                case 'color':
                    if (isValidHexCode(data[value])) {
                        main_interaction.message.embeds[0].color = isClear ? '' : data[value];
                    }
                    break;
                case 'image':
                    if (isClear) {
                        main_interaction.message.embeds[0].image = '';
                        break;
                    }
                    if (
                        (validURL(data[value]) && data[value].endsWith('jpg')) ||
                        data[value].endsWith('png') ||
                        data[value].endsWith('jpeg') ||
                        data[value].endsWith('gif')
                    ) {
                        if (
                            data[value].search('http://') === -1 &&
                            data[value].search('https://') === -1
                        )
                            data[value] = 'https://' + data[value];

                        if (!main_interaction.message.embeds[0].image)
                            main_interaction.message.embeds[0].image = {};
                        main_interaction.message.embeds[0].image.url = data[value];
                    }
                    break;
                case 'footer':
                    main_interaction.message.embeds[0].footer.text = isClear ? '' : data[value];
                    break;
                case 'category':
                    if (!main_interaction.guild.channels.cache.get(data[value])) {
                        reject('❌ The category you entered does not exist.');
                        return collector.stop();
                    }
                    break;
                case 'channel':
                    data[value] = removeMention(data[value]);
                    if (!main_interaction.guild.channels.cache.get(data[value])) {
                        reject('❌ The channel you entered does not exist.');
                        return collector.stop();
                    }
                    break;
                case 'applylink':
                    if (validURL(data[value])) {
                        if (
                            data[value].search('http://') === -1 &&
                            data[value].search('https://') === -1
                        )
                            data[value] = 'https://' + data[value];
                    }
                    break;
            }

            if (value.search('field') !== -1) {
                const field_name = data[value].split(':')[0];
                const field_value = data[value].split(':')[1];
                const field_number = value[value.length - 1] - 1;

                main_interaction.message.embeds[0].fields[field_number] = {};

                if (field_name && field_value) {
                    main_interaction.message.embeds[0].fields[field_number].name = field_name;
                    main_interaction.message.embeds[0].fields[field_number].value = field_value;
                } else {
                    return reject('❌ You have to enter a field name and value.');
                }
                data[value] = {
                    name: field_name,
                    value: field_value,
                };
            }

            await this.saveApplyForm({
                main_interaction,
                guild_id: main_interaction.guild.id,
                apply_id,
                embed_name: value,
                content: data[value],
                messageId: main_interaction.message.id,
            })
                .then(async () => {
                    const editEmbed = new EmbedBuilder()
                        .setColor(main_interaction.message.embeds[0].color)
                        .setTitle(main_interaction.message.embeds[0].title)
                        .setDescription(main_interaction.message.embeds[0].description || '')
                        .setFooter({
                            text: main_interaction.message.embeds[0].footer.text,
                        });

                    if (main_interaction.message.embeds[0].fields[0]) {
                        editEmbed.addFields([
                            {
                                name: main_interaction.message.embeds[0].fields[0].name,
                                value: main_interaction.message.embeds[0].fields[0].value,
                            },
                        ]);
                    }
                    if (main_interaction.message.embeds[0].fields[1]) {
                        editEmbed.addFields([
                            {
                                name: main_interaction.message.embeds[0].fields[1].name,
                                value: main_interaction.message.embeds[0].fields[1].value,
                            },
                        ]);
                    }

                    if (main_interaction.message.embeds[0].image) {
                        editEmbed.setImage(main_interaction.message.embeds[0].image.url);
                    }

                    await main_interaction.message
                        .edit({
                            embeds: [editEmbed],
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    reject(err);
                });
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                sentMessage.edit('Timed out.');
                await delay(4000);
            }
            sentMessage.delete();
        });
    });
};

module.exports.manageApplication = async ({ main_interaction, apply_id }) => {
    var applyForm = await this.getFormById({
        guild_id: main_interaction.guild.id,
        apply_id,
    });

    if (applyForm.error) {
        return main_interaction
            .reply({
                content: '❌ An error occured. Try again or contact the server moderation team.',
                ephemeral: true,
            })
            .catch((err) => {});
    }
    applyForm = applyForm.apply;

    if (applyForm.messageId !== main_interaction.message.id) return;

    const category = main_interaction.guild.channels.cache.get(applyForm.category);
    const channel_name = `application-${main_interaction.user.username.toLowerCase()}-${apply_id}`;

    const channel_exists = main_interaction.guild.channels.cache.find(
        (channel) => channel.name.toLowerCase() === channel_name
    );

    if (channel_exists) {
        return main_interaction
            .reply({
                content: '❌ You already have an open Application.',
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (!category) {
        return main_interaction
            .reply({
                content:
                    '❌ The administration didnt passed any Category. Please contact the server moderation team.',
                ephemeral: true,
            })
            .catch((err) => {});
    } else {
        main_interaction.guild.channels
            .create(`application-${main_interaction.user.username}-${apply_id}`, {
                type: 'text',
                parent: category,
                position: 1,
                permissionOverwrites: [
                    {
                        id: main_interaction.guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: main_interaction.user.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                    },
                ],
            })
            .then((channel) => {
                channel.setTopic(`Application ID: ${apply_id} - ${main_interaction.user.username}`);

                channel.send({
                    content: `${main_interaction.user} Please send all required information in this channel.`,
                });
            });
    }
};
