const config = require('../../../src/assets/json/_config/config.json');
const commandconfig = require('../../assets/json/command_config/command_config.json');

const {
    MessageEmbed,
    Permissions,
    MessageActionRow,
    MessageButton
} = require('discord.js');
const { removeHttp } = require('../../../utils/functions/removeCharacters');

const dns = require('dns');
const url = require('url');


const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { log } = require('../../../logs');
const database = require('../../db/db');



module.exports.run = async (bot, message, args) => {

    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    const setting = args[0];

    if(setting === commandconfig.scam.add.command) {

        var value = args[1];

        if(value == undefined) return message.reply('Please add an valid URL').catch(err => {});

        if(value.search('http://') !== -1 && value.search('https://') !== -1) {
            value = `http://${value}/`;

        }
        var pass = false;
        await database.query(`SELECT * FROM advancedScamList`).then(res => {
            if(res.length > 0) { 
                for(let i in res) {
                    if(res[i].guild_id === message.guild.id) {
                        pass = false;
                        return message.reply('Your server is on blacklist! You can\'t sent any requests until the bot moderators removes your server from it.').catch(err => {});
                    }
                    if(res[i].link === removeHttp(value)) {
                        pass = false;
                        return message.reply(`This URL already exits in current Scamlist`).catch(err => {});
                    }
                    pass = true;
                }
                
            }else {
                return pass = true;
            };
        }).catch(err => {
            return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
        })

        if(!pass) return  

        const parsedLookupUrl = url.parse(value);

        dns.lookup(parsedLookupUrl.protocol ? parsedLookupUrl.host : parsedLookupUrl.path, async (err, address, family) => {
            if(!err) {
                //? URL IS VALID
            
                value = removeHttp(value);

                const accept = 'accept';
                const deny = 'deny';

                const blacklist = 'blacklist';
                const blacklistLabel = 'Blacklist Server';

                const newScamLinkembed = new MessageEmbed()
                    .setTitle('New Advanced ScamList request')
                    .addField('**LINK:**', `\n${value}`)
                    .addField('**VIEW SCAN**', `https://www.urlvoid.com/scan/${value}/`)
                    .addField('**SERVER:**', `\n${message.guild.id} (${message.guild.name})`)
                    .setTimestamp()

                const buttons = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId(accept)
                            .setLabel(accept)
                            .setStyle('PRIMARY')                        
                    )
                    .addComponents(
                        new MessageButton()
                            .setCustomId(deny)
                            .setLabel(deny)
                            .setStyle('PRIMARY')                        
                    )
                    .addComponents(
                        new MessageButton()
                            .setCustomId(blacklist)
                            .setLabel(blacklistLabel)
                            .setStyle('DANGER')                        
                    )

                const sentMessage = await bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get('937032777583427586').send({embeds: [newScamLinkembed], components: [buttons]}).catch(err => {});
                await message.channel.send(`"**${value}**" Successfully sent a request to the Bot Moderators. You'll receive an status update in your direkt messages!`).catch(err => {});

                const collector = sentMessage.createMessageComponentCollector({
                    max: 1
                });

                collector.on('collect', async interaction => {
                    interaction.deferUpdate();
                    if(interaction.customId === accept) {
                        database.query(`INSERT INTO advancedScamList (link) VALUES (?)`, [value]).catch(err => errorhandler(err, config.errormessages.databasequeryerror, bot.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId), log, config));
                        return await message.author.send(`Your ScamList request was accepted! \n Link: \`${value}\` `).catch(err => {})
                    }else if(interaction.customId === deny) {
                        return await message.author.send(`Your ScamList request was denied! \n Link: \`${value}\` `).catch(err => {})
                    }else {
                        database.query(`INSERT INTO advancedScamList (guild_id) VALUES (?)`, [message.guild.id]).catch(err => errorhandler(err, config.errormessages.databasequeryerror, bot.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId), log, config));
                        return await message.author.send(`Your Server got added to the blacklist!`).catch(err => {})
                    }
                });

                collector.on('end', (collected, reason) => {
                    collected.forEach(x => {
                        for(let i in buttons.components) {
                            if(buttons.components[i].customId === x.customId) {
                                buttons.components[i].setStyle('SUCCESS');
                            }
                            buttons.components[i].setDisabled(true)
                        }
                        sentMessage.edit({embeds: [newScamLinkembed], components: [buttons]})
                    });
                    
                    return;
                });
                
            } else {
                //! URL IS INVALID
                 
                return message.reply('Invalid URL!');
            }
        });


    }else if(setting === commandconfig.scam.delete.command || setting === commandconfig.scam.delete.alias) {
        var value = args[1];

        if(value == undefined) return message.reply('Please add an valid URL').catch(err => {});

        if(value.search('http://') !== -1 && value.search('https://') !== -1) {
            value = `http://${value}/`;
        }

        var exits = false
        var pass = false;
        await database.query(`SELECT * FROM advancedScamList`).then(res => {
            for(let i in res) {
                if(res[i].guild_id === message.guild.id) {
                    pass = false;
                    return message.reply('Your server is on blacklist! You can\'t sent any requests until the bot moderators removes your server from it.').catch(err => {});
                }else if(res[i].link === removeHttp(value)) {
                    exits = true
                    pass = true;
                };
            }
        });
        if(!pass) return  
        if(!exits) { 
            message.reply('This URL doesn\'t exits in current list!').catch(err => {});
            return  
        } 

        const accept = 'accept';
        const deny = 'deny';

        const blacklist = 'blacklist';
        const blacklistLabel = 'Blacklist Server';

        const newScamLinkembed = new MessageEmbed()
        .setTitle('New **DELETE** Scam Link request')
        .addField('**LINK:**', `\n${removeHttp(value)}`)
        .addField('**VIEW SCAN**', `https://www.urlvoid.com/scan/${value}/`)
        .addField('**SERVER:**', `\n${message.guild.id} (${message.guild.name})`)
        .setTimestamp()

        const buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(accept)
                    .setLabel(accept)
                    .setStyle('PRIMARY')                        
            )
            .addComponents(
                new MessageButton()
                    .setCustomId(deny)
                    .setLabel(deny)
                    .setStyle('PRIMARY')                        
            )
            .addComponents(
                new MessageButton()
                    .setCustomId(blacklist)
                    .setLabel(blacklistLabel)
                    .setStyle('DANGER')                        
            )

        const sentMessage = await bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get('937032777583427586').send({embeds: [newScamLinkembed], components: [buttons]}).catch(err => {});

        const collector = sentMessage.createMessageComponentCollector({
            max: 1
        });

        collector.on('collect', async interaction => {
            await interaction.deferUpdate();
            if(interaction.customId === accept) {
                database.query(`DELETE FROM advancedScamList WHERE link = ?`, [removeHttp(value)]).catch(err => {
                    return errorhandler(err, config.errormessages.databasequeryerror, bot.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId), log, config)
                })
                return await message.author.send(`Your ScamList request was accepted! \n Link: \`${value}\` `).catch(err => {});
            }else if(interaction.customId === deny) {
                return await message.author.send(`Your ScamList request was denied! \n Link: \`${value}\` `).catch(err => {});
            }else {
                database.query(`INSERT INTO advancedScamList (guild_id) VALUES (?)`, [message.guild.id]).catch(err => {
                    return errorhandler(err, config.errormessages.databasequeryerror, bot.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId), log, config)
                });
                return await message.author.send(`Your Server got added to the blacklist!`).catch(err => {});
            }
        });

        collector.on('end', (collected, reason) => {
            collected.forEach(x => {
                for(let i in buttons.components) {
                    if(buttons.components[i].customId === x.customId) {
                        buttons.components[i].setStyle('SUCCESS');
                    }
                    buttons.components[i].setDisabled(true)
                }
                sentMessage.edit({embeds: [newScamLinkembed], components: [buttons]}).catch(err => {});
            });

        });
    }else if(setting === commandconfig.scam.view.command) {
        var value = args[1];

        if(value === undefined) {
            database.query(`SELECT * FROM advancedScamList WHERE link != ''`).then(async res => {
                const backId = 'back'
                const forwardId = 'forward'
                const backButton = new MessageButton({
                style: 'SECONDARY',
                label: 'Back',
                emoji: '⬅️',
                customId: backId
                });
                const forwardButton = new MessageButton({
                style: 'SECONDARY',
                label: 'Forward',
                emoji: '➡️',
                customId: forwardId
                });

                const embedMessage = new MessageEmbed()
                .setTitle('Showing all current blacklist Links')

                const generateEmbed = async start => {
                    for(i in res) {
                        if(i === (Number(start) + Number(30))) return;
                        embedMessage.addField('LINK:', res[start].link)
                    }
                    return embedMessage;
                }

                const canFitOnOnePage = res.length <= 30;
                const sentMessage = await message.channel.send({
                    embeds: [await generateEmbed(0)],
                    components: canFitOnOnePage ? [] : [new MessageActionRow({components: [forwardButton]})]
                }).catch(err => {});

                if(canFitOnOnePage) return;

                const collector = sentMessage.createMessageComponentCollector({
                    filter: ({user}) => user.id === message.author.id
                });

                let currentIndex = 0;
                collector.on('collect', async interaction => {
                    interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)

                    await interaction.update({
                        embeds: [await generateEmbed(currentIndex)],
                        components: [
                            new MessageActionRow({
                                components: [
                                    ...(currentIndex ? [backButton] : []),
                                    ...(currentIndex + 10 < data.length ? [forwardButton] : [])
                                ]
                            })
                        ]
                    });
                });

            }).catch(err => {
                return errorhandler(err, config.errormessages.databasequeryerror, bot.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId), log, config);
            })
        }else {
            value = removeHttp(value);
            
            return database.query(`SELECT link FROM advancedScamList WHERE link = ?`, [value]).then(res => {
                if(res.length <= 0) {
                    return message.reply('❌ **No results by searching this URL**');
                }

                return message.reply('✅ **Matching link found!**').catch(err => {});
            }).catch(err => {
                return errorhandler(err, config.errormessages.databasequeryerror, bot.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId), log, config);
            })
        }
    }
    else return;
}


module.exports.help = {
    name: "scam"
}