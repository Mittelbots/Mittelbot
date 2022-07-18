const config = require('../../../src/assets/json/_config/config.json');
const cmdconfig = require('../../../src/assets/json/command_config/command_config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const {
    hasPermission
} = require("../../../utils/functions/hasPermissions");
const levelAPI = require('../../../utils/functions/levelsystem/levelsystemAPI');
const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require('discord.js');
const database = require('../../db/db');
const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');
const {
    removeMention
} = require('../../../utils/functions/removeCharacters');


module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }

    if (!await hasPermission(message, 1, 0)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    let setting = args[0];

    if (setting === cmdconfig.levelsettings.rank.command || setting === cmdconfig.levelsettings.rank.alias) {

        var levelSettings = await levelAPI.getLevelSettingsFromGuild(message.guild.id);
        if(!levelSettings) levelSettings = [];

        const guild = await bot.guilds.cache.get(message.guild.id);

        const generateEmbed = async start => {
            const current = levelSettings.slice(start, start + 1);

            if(levelSettings.length === 0) {
                return new EmbedBuilder({
                    title: `Ranksettings for ${message.guild}`,
                    description: 'You don\'t have any ranks. Please add one to manage it.',  
                });
            }

            return new EmbedBuilder({
                title: `Ranksettings for ${message.guild}`,
                description: 'View, change, add or delete Ranksettings',
                fields: await Promise.all(
                    current.map(async levelSettings => ({
                        name: `Level: ${levelSettings.level}`,
                        value: `Needed XP: **${levelSettings.needXP}** \n Level Role: ${guild.roles.cache.get(levelSettings.role) || 'Not set'}`
                    }))
                )
            });
        }
        var canFitOnOnePage = levelSettings.length <= 3;

        let pass = true;
        const sentMessage = await message.channel.send({
            embeds: [await generateEmbed(0)]
        }).catch(err => {
            pass = false;
            return errorhandler({err});
        });

        if(!pass) return;

        var currentIndex = 0;

        const setComponentButtons = (min, max) => {
            currentIndex = max;
            const buttonsEmbed = new ActionRowBuilder()

            buttonsEmbed.addComponents(
                new ButtonBuilder({
                    style: ButtonStyle.Success,
                    label: `ADD`,
                    customId: 'ADD'
                })
            );

            if(levelSettings.length === 0) {
                return buttonsEmbed;
            }

            for (let i = min; i < max; i++) {
                buttonsEmbed.addComponents(
                    new ButtonBuilder({
                        style: 'SECONDARY',
                        label: `Update Level ${levelSettings[i].level}`,
                        customId: levelSettings[i].level
                    })
                )
                if(levelSettings.length - 1 === i) {
                    canFitOnOnePage = true;
                    continue;
                }else {
                    canFitOnOnePage = false;
                }
            }

            if(!canFitOnOnePage) {
                buttonsEmbed.addComponents(
                    new ButtonBuilder({
                        style: 'SUCCESS',
                        label: 'NEXT',
                        customId: 'NEXT'
                    })
                )
            }
            if(min > 0) {
                buttonsEmbed.addComponents(
                    new ButtonBuilder({
                        style: 'DANGER',
                        label: 'BACK',
                        customId: 'BACK'
                    })
                )
            }

            return buttonsEmbed;
        }
        await sentMessage.edit({
            components: [setComponentButtons(0, 1)]
        }).catch(err => {});

        const collector = await sentMessage.createMessageComponentCollector({
            filter: ({
                user
            }) => user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async interaction => {
            for (let i in levelSettings) {
                if (interaction.customId === levelSettings[i].level) {
                    
                    const updateButtonId = 'update'
                    const updateButton = new ButtonBuilder({
                        style: 'SUCCESS',
                        label: 'UPDATE XP',
                        customId: updateButtonId
                    });

                    const updateRoleButtonId = 'updateRole';
                    const updateRoleButton = new ButtonBuilder({
                        style: 'SUCCESS',
                        label: 'UPDATE ROLE',
                        customId: updateRoleButtonId
                    });

                    const deleteButtonId = 'delete'
                    const deleteButton = new ButtonBuilder({
                        style: 'DANGER',
                        label: 'DELETE',
                        customId: deleteButtonId
                    });
                    
                    var updateMessage = new EmbedBuilder()
                        .setDescription(`View delete or update ${guild.roles.cache.get(levelSettings[i].role)}`)
                        .addFields([
                            { name: `Level: ${levelSettings[i].level}`, value: `XP: **${levelSettings[i].needXP}**` }
                        ])
                        .setTimestamp()

                    updateMessage = await interaction.update({
                        embeds: [updateMessage],
                        components: [new ActionRowBuilder({
                            components: [updateButton, updateRoleButton, deleteButton]
                        })]
                    }).catch(err => {});

                    const collector2 = sentMessage.createMessageComponentCollector({
                        filter: ({
                            user
                        }) => user.id === message.author.id,
                        time: 15000,
                        max: 1
                    });

                    collector2.on('collect', async interaction => {
                        interaction.deferUpdate();
                        for(let i in collector2.options.message.components[0].components) {
                            collector2.options.message.components[0].components[i].setDisabled(true)
                        }
        
                        collector2.options.message.edit({
                            components: [collector2.options.message.components[0]]
                        });

                        if (interaction.customId === updateButtonId) {
                            message.channel.send('Please provide the needed XP that a user have to reach You\'ll get each Message à one Minute between 15-35 XP').catch(err => {});

                            const collector3 = message.channel.createMessageCollector({
                                filter: (m) => m.author.id === message.author.id,
                                time: 15000,
                                max: 1
                            });

                            collector3.on('collect', async reply => {
                                if (isNaN(parseInt(reply))) {
                                    return reply.reply('Invalid Message provided. Only Numbers are allowed. Try again!').catch(err => {});
                                }
                                levelSettings[i].needXP = reply.content;

                                database.query(`UPDATE ${message.guild.id}_config SET levelsettings = ?`, [JSON.stringify(levelSettings)])
                                    .then(() => {
                                        reply.delete();
                                        message.channel.send(`Successfully Changed the XP Rage to ${levelSettings[i].needXP}`).catch(err => {});
                                    })
                                    .catch(err => {
                                        return errorhandler({err});
                                    })
                            });
                            collector3.on('end', (collected, reason) => {
                                if(reason === 'time') {
                                    collector3.options.message.edit({content: '**Time limit reached**'})
                                }
                            });
                        } else if(interaction.customId === updateRoleButtonId) {
                            message.channel.send('Please provide a valid Role mention to change the current setting');

                            const rolecollector = message.channel.createMessageCollector({
                                filter: (m) => m.author.id === message.author.id,
                                time: 15000,
                                max: 1
                            });

                            rolecollector.on('collect', async reply => {

                                if(reply.content.toLowerCase() === 'none') return;

                                const role = await guild.roles.cache.get(reply.content)

                                if(!role) return message.reply('Invalid role provided. Please mention an existing role!')

                                levelSettings[i].role = removeMention(reply.content);

                                database.query(`UPDATE ${message.guild.id}_config SET levelsettings = ?`, [JSON.stringify(levelSettings), message.guild.id])
                                    .then(() => {
                                        reply.delete();
                                        message.channel.send(`Successfully changed the role to <@&${levelSettings[i].role}>`).catch(err => {});
                                    })
                                    .catch(err => {
                                        return errorhandler({err});
                                    })
                            });
                            rolecollector.on('end', (collected, reason) => {
                                if(reason === 'time') {
                                    rolecollector.options.message.edit({content: '**Time limit reached**'}).catch(err => {});
                                }
                            });

                            //? DELETE BUTTON
                        } else {
                            database.query(`UPDATE ${message.guild.id}_config SET levelsettings = ?`, [JSON.stringify(levelSettings.filter(data => data.level !== levelSettings[i].level))])
                                .then(() => {
                                    message.channel.send(`Successfully delete level ${levelSettings[i].level}`).catch(err => {});
                                })
                                .catch(err => {
                                    return errorhandler({err});
                                })
                        }
                    });
                    collector2.on('end', (collected, reason) => {
                        if(reason === 'time') {
                            collector2.options.message.edit('**Time limit reached**')
                        }
                    })
                }
            }
            if (interaction.customId === 'ADD') {
                message.channel.send('Which Level you want to add? Please use this Syntax: "LEVEL ROLE NEEDED-XP"').catch(err => {});
                message.channel.send('--> _If you don\'t want to set a role, just write "none" instead of the role_ <--').catch(err => {});

                interaction.deferUpdate();
                for(let i in collector.options.message.components[0].components) {
                    collector.options.message.components[0].components[i].setDisabled(true)
                }

                collector.options.message.edit({
                    components: [collector.options.message.components[0]]
                });
                
                const collector4 = message.channel.createMessageCollector({
                    filter: (m) => m.author.id === message.author.id,
                    time: 15000,
                    max: 1
                });

                collector4.on('collect', async message => {
                    reply = message.content.split(' ');

                    if (isNaN(parseInt(reply[0]))) {
                        return message.reply('Invalid level provided. Only numbers are allowed. Try again!')
                    }

                    const alreadyExits = levelSettings.filter(el => el.level === reply[0]);
                    if(alreadyExits.length !== 0) {
                        return message.reply('Invalid level provided. This level already exists!').catch(err => {});
                    }

                    try {
                        guild.roles.cache.get(removeMention(reply[1]))
                    }catch(err) {
                        return message.reply('Invalid role provided. Please mention an existing role!').catch(err => {});
                    }
                    
                    if(reply[2] <= 0) {
                        return message.reply('Invalid XP provided. Number cant be lower or equal to 0!').catch(err => {});
                    }
                    if(isNaN(parseInt(reply[2]))) {
                        return message.reply('Invalid XP provided. Only numbers are allowed. Try again!').catch(err => {});
                    }

                    levelSettings.push({
                        level: reply[0],
                        role: removeMention(reply[1]),
                        needXP: reply[2]
                    });

                    var newLevelSettings = levelSettings.sort(function (a, b) {
                        return a.level - b.level;
                      });

                    await levelAPI.setLevelSettingsFromGuild(guild.id, JSON.stringify(newLevelSettings));

                    message.delete();
                    return message.channel.send('Saved!').catch(err => {});
                });

                collector4.on('end', async (collected, reason) => {

                });

            }else if(interaction.customId === 'NEXT') {
                interaction.deferUpdate();

                await sentMessage.edit({
                    embeds: [await generateEmbed(currentIndex)],
                    components: [setComponentButtons(currentIndex, currentIndex + 1)]
                }).catch(err => {});
            }else if(interaction.customId === 'BACK') {
                interaction.deferUpdate();
                await sentMessage.edit({
                    embeds: [await generateEmbed((currentIndex - 2) )],
                    components: [setComponentButtons(currentIndex - 2, currentIndex - 1)]
                }).catch(err => {});
            }
        });

        collector.on('end', (collected, reason) => {
            if(reason == 'time'){
                for(let i in collector.options.message.components[0].components) {
                    collector.options.message.components[0].components[i].setStyle('DANGER');
                    collector.options.message.components[0].components[i].setDisabled(true)
                }

                collector.options.message.edit({content: '**Time limit reached**', 
                    components: [collector.options.message.components[0]]
                });
            }
        });
    }
}

module.exports.help = cmd_help.admin.levelsettings;