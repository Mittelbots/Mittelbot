const {
    ActionRowBuilder,
    EmbedBuilder,
    SelectMenuBuilder
} = require("discord.js");
const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    delay
} = require('../delay/delay');
const {
    validURL
} = require("../validate/isValidURL");
const {
    isValidHexCode
} = require("../validate/isValidHexCode");
const {
    validateCustomStrings
} = require("../validate/validateCustomStrings");
const { getGuildConfig, updateGuildConfig } = require("./getConfig");

module.exports.save_welcomechannelId = async ({
    guild_id,
    welcomechannel_id
}) => {
    return new Promise(async (resolve, reject) => {
        await this.getWelcomechannel({
            guild_id
        }).then(async res => {
            if (!res || res === "[]") {
                res = {
                    id: "",
                    active: false
                }
            } else {
                res = JSON.parse(res);
            }

            res.id = welcomechannel_id;

            await updateGuildConfig({
                guild_id,
                value: JSON.stringify(res),
                valueName: 'welcome_channel'
            })

        }).catch(() => {
            return reject('Something went wrong.');
        })
    })
}

//=========================================================

module.exports.getWelcomechannel = async ({
    guild_id
}) => {
    return new Promise(async (resolve, reject) => {
        const config = getGuildConfig({
            guild_id
        });

        if(config && config.welcome_channel) {
            return resolve(config[0].welcome_channel);
        }else {
            return reject(false);
        }
    })
}

module.exports.saveWelcomeMessageContent = async ({
    guild_id,
    embed_name,
    content
}) => {
    return new Promise(async (resolve, reject) => {
        await this.getWelcomechannel({
            guild_id
        }).then(async res => {
            if (!res || res === "[]") {
                return reject("Welcome channel is not set.");
            }

            res = JSON.parse(res);

            res[embed_name] = content;

            await updateGuildConfig({
                guild_id,
                value: JSON.stringify(res),
                valueName: 'welcome_channel'
            })
        }).catch(() => {
            reject('Something went wrong.')
        })
    })
}

//=========================================================

module.exports.manageNewWelcomeSetting = async ({
    main_interaction,
}) => {
    return new Promise(async (resolve, reject) => {

        main_interaction.values = main_interaction.values[0]

        const value = main_interaction.values.split('_')[0];
        const guild_id = main_interaction.values.split('_')[1];


        if (value === 'save') {
            return await this.saveWelcomeMessageContent({
                    guild_id,
                    embed_name: 'active',
                    content: true
                }).then(res => {
                    main_interaction.channel.send(res)
                        .then(async msg => {
                            await delay(2000);
                            await msg.delete();
                        })
                        .catch(err => {});
                })
                .catch(err => {
                    main_interaction.channel.send(err)
                        .then(async msg => {
                            await delay(2000);
                            await msg.delete();
                        })
                        .catch(err => {});
                })
        }

        const sentMessage = await main_interaction.channel.send('🔎 Please add the content for your choosen setting. ||`cancel` stops the current collector, `clear` will clear the current option to \'\'||')

        const collector = main_interaction.message.channel.createMessageCollector({
            max: 1,
            time: 120000,
            filter: ((user) => user.author.id === main_interaction.user.id)
        })

        const data = {};

        collector.on('collect', async (message) => {

            let isClear = false;

            if (message.content.toLowerCase() === 'cancel') {
                message.delete().catch(err => {})
                collector.stop();
                return;
            } else if (message.content.toLowerCase() === 'clear') {
                isClear = true;
                data[value] = '';
            } else {
                pass = true;
            }

            data[value] = message.content;
            message.delete().catch(err => {})

            switch (value) {
                case 'message':
                    if (!isClear) {
                        const array = main_interaction.message.content.split(" ");
                        const index = array.indexOf('Message:');
                        var newMessage = array.splice(0, index + 1).join(" ") + " \n **" + data[value] + '**';
                    }
                    main_interaction.message.content = newMessage || ''
                    break;
                case 'author':
                    main_interaction.message.embeds[0].author.name = (isClear) ? '' : data[value];
                    break;
                case 'title':
                    main_interaction.message.embeds[0].title = (isClear) ? '' : data[value];
                    break;
                case 'description':
                    main_interaction.message.embeds[0].description = (isClear) ? '' : data[value];
                    break;
                case 'thumbnail':
                    if (isClear) {
                        main_interaction.message.embeds[0].thumbnail = '';
                        break;
                    }
                    if (validURL(data[value]) && data[value].endsWith('jpg') || data[value].endsWith('png') || data[value] === '{pfp}') {
                        if (data[value] !== '{pfp}') {
                            if (data[value].search('http://') === -1 && data[value].search('https://') === -1) data[value] = 'https://' + data[value];
                        }
                        if(!main_interaction.message.embeds[0].thumbnail) main_interaction.message.embeds[0].thumbnail = {};
                        main_interaction.message.embeds[0].thumbnail.url = validateCustomStrings({
                            string: data[value],
                            joined_user: main_interaction
                        })
                    }
                    break;
                case 'url':
                    if (isClear) {
                        main_interaction.message.embeds[0].url = '';
                        break;
                    }
                    if (validURL(data[value])) {
                        if (data[value].search('http://') === -1 && data[value].search('https://') === -1) data[value] = 'https://' + data[value];

                        main_interaction.message.embeds[0].url = (isClear) ? '' : data[value];
                    }
                    break;
                case 'color':
                    if (isValidHexCode(data[value])) {
                        main_interaction.message.embeds[0].color = data[value];
                    }
                    break;
                case 'image':
                    if (isClear) {
                        main_interaction.message.embeds[0].image = '';
                        break;
                    }
                    if(data[value] === '{pfp}') {
                        if(!main_interaction.message.embeds[0].image) main_interaction.message.embeds[0].image = {};
                        main_interaction.message.embeds[0].image.url = validateCustomStrings({
                            string: data[value],
                            joined_user: main_interaction
                        });
                        break;
                    }
                    if (validURL(data[value]) && data[value].endsWith('jpg') || data[value].endsWith('png') || data[value].endsWith('jpeg') || data[value].endsWith('gif')) {
                        if (data[value].search('http://') === -1 && data[value].search('https://') === -1) data[value] = 'https://' + data[value];

                        if(!main_interaction.message.embeds[0].image) main_interaction.message.embeds[0].image = {};
                        main_interaction.message.embeds[0].image.url = data[value];
                    }
                    break;
                case 'footer':
                    main_interaction.message.embeds[0].footer.text = (isClear) ? '' : data[value];
                    break;
            }

            await this.saveWelcomeMessageContent({
                guild_id,
                embed_name: value,
                content: data[value]
            }).then(async () => {
                const editEmbed = new EmbedBuilder()
                    .setColor(main_interaction.message.embeds[0].color)
                    .setAuthor({
                        name: main_interaction.message.embeds[0].author.name
                    })
                    .setTitle(main_interaction.message.embeds[0].title)
                    .setURL(main_interaction.message.embeds[0].url)
                    .setDescription(main_interaction.message.embeds[0].description || '')
                    
                    .addFields([{name: 'This is an example field name', value: 'This is an example field value'}])
                    
                    .setFooter({
                        text: main_interaction.message.embeds[0].footer.text
                    })
                    .setTimestamp()

                if(main_interaction.message.embeds[0].thumbnail) {
                    editEmbed.setThumbnail(main_interaction.message.embeds[0].thumbnail.url)
                }

                if(main_interaction.message.embeds[0].image) {
                    editEmbed.setImage(main_interaction.message.embeds[0].image.url)
                }

                await main_interaction.message.edit({
                    content: main_interaction.message.content,
                    embeds: [editEmbed]
                }).catch(err => {})
            }).catch(err => {
                reject(err);
            })
            collector.stop();
        })

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                sentMessage.edit('Timed out.')
                await delay(4000);
            }
            sentMessage.delete();
        })
    })
}


module.exports.sendWelcomeSetting = async ({
    main_interaction
}) => {
    return new Promise(async (resolve, reject) => {

        await this.getWelcomechannel({
            guild_id: main_interaction.guild.id
        }).then(async res => {
            if (!res || res === "[]") {
                res = null;
            } else {
                res = JSON.parse(res);
            }
            const exampleEmbed = new EmbedBuilder()
                .setColor(res.color || '#0099ff')
                .setAuthor({
                    name: res.author || main_interaction.user.username
                })
                .setTitle(res.title || 'This is an example title')
                .setURL(res.url || 'https://www.youtube.com/watch?v=d1YBv2mWll0')
                .setDescription(res.description || 'This is an example description')
                .addFields([{name: 'This is an example field name', value: 'This is an example field value'}])
                .setImage(res.image || 'https://cdn.boop.pl/uploads/2021/05/E1LVzWfWQAMbRiA.jpg')
                .setFooter({
                    text: res.footer || 'This is an example footer'
                })
                .setTimestamp()

            if(res.thumbnail === '{pfp}') {
                exampleEmbed.setThumbnail(main_interaction.user.avatarURL({
                    format: 'jpg'
                }))
            }else {
                exampleEmbed.setThumbnail(res.thumbnail || 'https://cdn.boop.pl/uploads/2021/05/E1LVzWfWQAMbRiA.jpg')
            }

            //=========================================================//

            const menu = new SelectMenuBuilder()
                .setCustomId('welcomemessage')
                .setPlaceholder('Choose the options')

            menu.addOptions([{
                'value': `message_${main_interaction.guild.id}`,
                'label': 'Message over of the embed'
            }])

            menu.addOptions([{
                'value': `author_${main_interaction.guild.id}`,
                'label': 'Author at the top of the embed'
            }])

            menu.addOptions([{
                'value': `color_${main_interaction.guild.id}`,
                'label': 'Set the color for your embed (#FFFFF)'
            }])

            menu.addOptions([{
                'value': `title_${main_interaction.guild.id}`,
                'label': 'Title of the embed'
            }])

            menu.addOptions([{
                'value': `url_${main_interaction.guild.id}`,
                'label': 'Set a URL for the title [LINK ONLY]'
            }])

            menu.addOptions([{
                'value': `description_${main_interaction.guild.id}`,
                'label': 'Description of the embed'
            }])

            menu.addOptions([{
                'value': `thumbnail_${main_interaction.guild.id}`,
                'label': 'Set a thumbnail for the embed [LINK ONLY + .jpg/.png]'
            }])

            // menu.addOptions([{
            //     'value': `field_${main_interaction.guild.id}`,
            //     'label': 'Add a field to the embed'
            // }])

            menu.addOptions([{
                'value': `image_${main_interaction.guild.id}`,
                'label': 'Set an image for the embed [LINK ONLY + .jpg/.png]'
            }])

            // menu.addOptions([{
            //     'value': `timestamp_${main_interaction.guild.id}`,
            //     'label': 'Activate or deactivate the timestamp'
            // }])

            menu.addOptions([{
                'value': `save_${main_interaction.guild.id}`,
                'label': 'Save the current embed and activate it.'
            }])


            await main_interaction.channel.send({
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
\n\n Your Message: \n${'**'+res.message+'**' || '_not set yet_'}
            `,
                embeds: [exampleEmbed],
                components: [new ActionRowBuilder({
                    components: [menu]
                })]
            }).catch(err => {
                reject(err);
            })

        }).catch(err => {
            errorhandler({
                err,
                fatal: true
            })
            reject('Something went wrong.')
        })


    })
}


module.exports.sendWelcomeMessage = async ({
    guild_id,
    bot,
    joined_user
}) => {
    return new Promise(async (resolve, reject) => {
        await this.getWelcomechannel({
            guild_id
        }).then(res => {
            if (!res || res === "[]") {
                return reject("Welcome channel is not set.");
            }

            res = JSON.parse(res);

            if (res.active) {
                if (!res.id) return reject("Welcome channel is not set.");

                const welcomeMessage = new EmbedBuilder()
                    .setColor(res.color || null)
                    .setAuthor({
                        name: validateCustomStrings({
                            string: res.author,
                            joined_user,
                        })
                    })
                    .setTitle(validateCustomStrings({
                        string: res.title,
                        joined_user
                    }))
                    .setURL(res.url)
                    .setDescription(validateCustomStrings({
                        string: res.description,
                        joined_user
                    }))
                    .setImage(validateCustomStrings({
                        string: res.image,
                        joined_user
                    }))
                    .setThumbnail(validateCustomStrings({
                        string: res.thumbnail,
                        joined_user
                    }))
                    .setTimestamp()

                bot.guilds.cache.get(guild_id).channels.cache.get(res.id).send({
                    content: validateCustomStrings({
                        string: res.message,
                        joined_user
                    }),
                    embeds: [welcomeMessage]
                }).catch(err => {
                    reject(err);
                })
            }

        }).catch(() => {
            reject('Something went wrong.')
        })
    })
}