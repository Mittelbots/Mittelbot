const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const {
    save_welcomechannelId,
    sendWelcomeSetting
} = require("../../../utils/functions/data/welcomechannel");
const {
    checkPrefix,
    updateConfig
} = require('../../../utils/functions/data/getConfig');
const config = require('../../../src/assets/json/_config/config.json');
const {
    updateJoinroles
} = require('../../../utils/functions/data/joinroles');
const { updateCache } = require("../../../utils/functions/cache/cache");
const database = require("../../db/db");
const { updateWarnroles } = require("../../../utils/functions/data/warnroles");
const { viewAllSettings } = require('../../../utils/functions/settings/viewAllSettings');
const { changeYtNotifier, delChannelFromList } = require("../../../utils/functions/data/youtube");
const { changeTwitchNotifier, delTwChannelFromList } = require("../../../utils/functions/data/twitch");

module.exports.run = async ({
    main_interaction,
    bot
}) => {

    const hasPermission = await main_interaction.member.permissions.has('ADMINISTRATOR');
    if(!hasPermission) {
        return main_interaction.reply({
            content: lang.errors.noperms,
            ephemeral: true
        }).catch(err => {})
    }

    switch (main_interaction.options.getSubcommand()) {

        case 'view':
            var currentsettings = await database.query(`SELECT * FROM ${main_interaction.guild.id}_config LIMIT 1`).then(async res => {
                return await res[0];
            }).catch(err => {
                errorhandler({err, fatal: true});
                return main_interaction.reply({
                    content: `${config.errormessages.databasequeryerror}`
                }).catch(err => {});
            });

            await viewAllSettings({
                currentsettings,
                guild: main_interaction.guild,
                bot
            }).then(res => {
                main_interaction.reply({
                    embeds: [res],
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {})
            })
            break;

        case 'welcomemessage':
            let pass = false;
            await save_welcomechannelId({
                guild_id: main_interaction.guild.id,
                welcomechannel_id: main_interaction.options.getChannel('channel').id
            }).then(res => {
                pass = true;
                main_interaction.reply({
                    content: '✅ ' + res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: '❌ ' + err,
                    ephemeral: true
                }).catch(err => {})
            })
            if (!pass) return;

            sendWelcomeSetting({
                main_interaction,
            })
            break;

        case 'prefix':
            const prefix = main_interaction.options.getString('prefix');
            const prefixCheck = checkPrefix({
                value: prefix
            })
            if (prefixCheck === false) return main_interaction.reply({
                content: `Invalid Prefix`,
                ephemeral: true
            }).catch(err => {});
            await saveSetting({
                value: prefix,
                valueName: config.settings.prefix.colname,
            });
            main_interaction.reply({
                content: `✅ Prefix updated to ${prefix}`,
                ephemeral: true
            }).catch(err => {});
            break;

        case 'cooldown':
            const cooldown = main_interaction.options.getNumber('cooldown');
            if (cooldown < 1) {
                await saveSetting({
                    value: 0, //? convert to milliseconds
                    valueName: config.settings.cooldown.colname,
                });
                main_interaction.reply({
                    content: `✅ Command Cooldown successfully turned off \n \n**Info: A default Cooldown of 2 Seconds is still enabled to protect the bot from spam!**`,
                    ephemeral: true
                }).catch(err => {});
            } else {
                await saveSetting({
                    value: cooldown * 1000, //? convert to milliseconds
                    valueName: config.settings.cooldown.colname,
                });
                main_interaction.reply({
                    content: `✅ Command Cooldown successfully changed to ${cooldown} seconds \n \n**Info: Cooldown can be interupted when the bot is offline!**`,
                    ephemeral: true
                }).catch(err => {});
            }
            break;


        case 'dmcau':
            const dmcau = main_interaction.options.getBoolean('dmcau');
            await saveSetting({
                value: dmcau,
                valueName: config.settings.dmcau.colname,
            });
            main_interaction.reply({
                content: `✅ Moderation commands will be **${(dmcau) ? 'deleted' : 'kept'}** after usage.`,
                ephemeral: true
            }).catch(err => {});
            break;


        case 'dcau':
            const dcau = main_interaction.options.getBoolean('dcau');
            await saveSetting({
                value: dcau,
                valueName: config.settings.dcau.colname,
            });
            main_interaction.reply({
                content: `✅ Commands will be **${(dcau) ? 'deleted' : 'kept'}** after usage.`,
                ephemeral: true
            }).catch(err => {});
            break;

        case 'joinroles':
            var joinroles = []
            for (let i = 1; i <= 5; i++) {
                let role = main_interaction.options.getRole('joinrole' + i)

                if (role) joinroles.push(role.id)
            }
            updateJoinroles({
                guild: main_interaction.guild,
                roles: joinroles,
                user: bot.guilds.cache.get(main_interaction.guild.id).members.cache.get(main_interaction.user.id),
            }).then(() => {
                main_interaction.reply({
                    content: `✅ Join Roles updated!`,
                    ephemeral: true
                }).catch(err => {});
            }).catch(err => {
                main_interaction.reply({
                    content: `❌ ${err}`,
                    ephemeral: true
                }).catch(err => {});
            });
            break;

        case 'log':
            const auditlog = main_interaction.options.getChannel('auditlog');
            const messagelog = main_interaction.options.getChannel('messagelog');
            const modlog = main_interaction.options.getChannel('modlog');
            const clear = main_interaction.options.getString('clear');


            if (auditlog !== null) {
                await updateLog({
                    channel: auditlog,
                    dbcol: config.settings.auditlog.colname,
                })
            }

            if (messagelog !== null) {
                await updateLog({
                    channel: messagelog,
                    dbcol: config.settings.messagelog.colname,
                })
            }

            if (modlog !== null) {
                await updateLog({
                    channel: modlog,
                    dbcol: config.settings.modlog.colname,
                })
            }

            async function updateLog({
                channel,
                dbcol,
            }) {
                await updateCache({
                    cacheName: 'logs',
                    param_id: main_interaction.guild.id,
                    updateVal: (JSON.parse(clear)) ? null : channel.id,
                    updateValName: dbcol
                });
    
                database.query(`UPDATE ${main_interaction.guild.id}_guild_logs SET ${dbcol} = ? WHERE id = 1`, [(JSON.parse(clear)) ? null : channel.id])
                .catch(err => {
                    return errorhandler({
                        err,
                        fatal: true
                    });
                });
            }
            main_interaction.reply({
                content: `✅ Log channel updated!`,
                ephemeral: true
            }).catch(err => {});

            break;

        case 'warnroles':
            var warnroles = []
            for (let i = 1; i <= 5; i++) {
                let role = main_interaction.options.getRole('warnrole' + i)

                if (role) warnroles.push(role.id)
            }
            updateWarnroles({
                guild: main_interaction.guild,
                roles: warnroles,
                user: bot.guilds.cache.get(main_interaction.guild.id).members.cache.get(main_interaction.user.id),
            }).then(() => {
                main_interaction.reply({
                    content: `✅ Warn Roles updated!`,
                    ephemeral: true
                }).catch(err => {});
            }).catch(err => {
                main_interaction.reply({
                    content: `❌ ${err}`,
                    ephemeral: true
                }).catch(err => {});
            });
            break;

        case 'youtube':
            const ytchannel = main_interaction.options.getString('ytchannel');
            const dcchannel = main_interaction.options.getChannel('dcchannel');
            const pingrole = main_interaction.options.getRole('ytping')

            changeYtNotifier({
                ytchannel,
                dcchannel,
                pingrole,
                guild: main_interaction.guild,
            }).then(res => {
                main_interaction.reply({
                    content: res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {});
            });
            break;
        
        case 'delyoutube':
            const delytchannel = main_interaction.options.getString('ytchannel');
            
            delChannelFromList({
                guild_id: main_interaction.guild.id,
                delytchannel
            }).then(res => {
                main_interaction.reply({
                    content: res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {});
            });
            break;

        case 'twitch':
            const twitchchannel = main_interaction.options.getString('twitchchannel');
            const twdcchannel = main_interaction.options.getChannel('dcchannel');
            const twpingrole = main_interaction.options.getRole('twitchping')

            changeTwitchNotifier({
                twitchchannel,
                twdcchannel,
                twpingrole,
                guild: main_interaction.guild,
            }).then(res => {
                main_interaction.reply({
                    content: res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {});
            });
            break;

        case 'deltwitch':
            const deltwchannel = main_interaction.options.getString('twchannel');
            
            delTwChannelFromList({
                guild_id: main_interaction.guild.id,
                deltwchannel
            }).then(res => {
                main_interaction.reply({
                    content: res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {});
            });
            break;

    }

    async function saveSetting({
        value,
        valueName
    }) {
        await updateConfig({
            guild_id: main_interaction.guild.id,
            value,
            valueName
        })

    }
}

module.exports.data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('All important settings which you can set, edit or remove.')
    .addSubcommand(command =>
        command
        .setName('view')
        .setDescription('View all of your settings')
    )
    .addSubcommand(command =>
        command
        .setName('welcomemessage')
        .setDescription('Set the welcome message and channel.')
        .addChannelOption(channel =>
            channel
            .setName('channel')
            .setDescription('The channel you want to set as welcome channel.')
            .setRequired(true)
        )
    )
    .addSubcommand(command =>
        command
        .setName('prefix')
        .setDescription('Set the prefix for your Guild.')
        .addStringOption(prefix =>
            prefix
            .setName('prefix')
            .setDescription('The prefix you want to set.')
            .setRequired(true)
        )
    )
    .addSubcommand(command =>
        command
        .setName('cooldown')
        .setDescription('Set the cooldown for your Guild.')
        .addNumberOption(cooldown =>
            cooldown
            .setName('cooldown')
            .setDescription('The cooldown you want to set. (in seconds)')
            .setRequired(true)
        )
    )
    .addSubcommand(command =>
        command
        .setName('dmcau')
        .setDescription('Decide if moderation commands gets deleted after usage.')
        .addBooleanOption(dmcau =>
            dmcau
            .setName('dmcau')
            .setDescription('True if you want to delete the command after usage. False if you want to keep it.')
            .setRequired(true)
        )
    )
    .addSubcommand(command =>
        command
        .setName('dcau')
        .setDescription('Decide if commands gets deleted after usage.')
        .addBooleanOption(dmcau =>
            dmcau
            .setName('dcau')
            .setDescription('True if you want to delete the command after usage. False if you want to keep it.')
            .setRequired(true)
        )
    )
    .addSubcommand(command =>
        command
        .setName('joinroles')
        .setDescription('Add up to 5 join roles. Note: If you mention a existing role, it will be removed')
        .addRoleOption(joinrole =>
            joinrole
            .setName('joinrole1')
            .setDescription('Add a role to the list of join roles.')
            .setRequired(false)
        )
        .addRoleOption(joinrole =>
            joinrole
            .setName('joinrole2')
            .setDescription('Add a role to the list of join roles.')
            .setRequired(false)
        )
        .addRoleOption(joinrole =>
            joinrole
            .setName('joinrole3')
            .setDescription('Add a role to the list of join roles.')
            .setRequired(false)
        )
        .addRoleOption(joinrole =>
            joinrole
            .setName('joinrole4')
            .setDescription('Add a role to the list of join roles.')
            .setRequired(false)
        )
        .addRoleOption(joinrole =>
            joinrole
            .setName('joinrole5')
            .setDescription('Add a role to the list of join roles.')
            .setRequired(false)
        )
    )
    .addSubcommand(command =>
        command
        .setName('log')
        .setDescription('Choose your log channel.')
        .addChannelOption(auditlog =>
            auditlog
            .setName('auditlog')
            .setDescription('Add a channel to see delted messages or changes from the server.')
            .setRequired(false)
        )
        .addChannelOption(messagelog =>
            messagelog
            .setName('messagelog')
            .setDescription('Add a channel to see edited messages.')
            .setRequired(false)
        )
        .addChannelOption(modlog =>
            modlog
            .setName('modlog')
            .setDescription('Add a channel to see moderation logs for example if a user gets muted.')
            .setRequired(false)
        )
        .addStringOption(clear =>
            clear
            .setName('clear')
            .setDescription('Select true if you want to clear the log channels you have selected.')
            .setRequired(false)
            .addChoices({
                name: 'Yes',
                value: 'true'
            })
        )
    )
    .addSubcommand(command =>
        command
        .setName('warnroles')
        .setDescription('Add up to 5 roles. Note: If you mention a existing role, it will be removed.')
        .addRoleOption(warnrole =>
            warnrole
            .setName('warnrole1')
            .setDescription('Add a role to the list of warn roles.')
            .setRequired(false)
        )
        .addRoleOption(warnrole =>
            warnrole
            .setName('warnrole2')
            .setDescription('Add a role to the list of warn roles.')
            .setRequired(false)
        )
        .addRoleOption(warnrole =>
            warnrole
            .setName('warnrole3')
            .setDescription('Add a role to the list of warn roles.')
            .setRequired(false)
        )
        .addRoleOption(warnrole =>
            warnrole
            .setName('warnrole4')
            .setDescription('Add a role to the list of warn roles.')
            .setRequired(false)
        )
        .addRoleOption(warnrole =>
            warnrole
            .setName('warnrole5')
            .setDescription('Add a role to the list of warn roles.')
            .setRequired(false)
        )
    )
    .addSubcommand(command =>
        command
        .setName('youtube')
        .setDescription('Add up to 3 youtube channels to get a notification when a new video is uploaded.')
        .addStringOption(ytchannel =>
            ytchannel
            .setName('ytchannel')
            .setDescription('Add the youtube channel link [https://youtube.com/channel/XXXX]')
            .setRequired(true)
        )
        .addChannelOption(dcchannel =>
            dcchannel
            .setName('dcchannel')
            .setDescription('Select a text channel where the new videos will be post in.')
            .setRequired(true)
        )
        .addRoleOption(warnrole =>
            warnrole
            .setName('ytping')
            .setDescription('Add a ping role to be pinged each time a new Video is uploaded.')
            .setRequired(false)
        )
    )
    .addSubcommand(command =>
        command
        .setName('delyoutube')
        .setDescription('Delete a channel from the notification list')
        .addStringOption(ytchannel =>
            ytchannel
            .setName('ytchannel')
            .setDescription('Add the youtube channel link [https://youtube.com/channel/XXXX]')
            .setRequired(true)
        )
    )
    .addSubcommand(command =>
        command
        .setName('twitch')
        .setDescription('Add up to 3 twitch channels to get a notification when a new video is uploaded.')
        .addStringOption(ytchannel =>
            ytchannel
            .setName('twitchchannel')
            .setDescription('Add the twitch channel name.')
            .setRequired(true)
        )
        .addChannelOption(dcchannel =>
            dcchannel
            .setName('dcchannel')
            .setDescription('Select a text channel where the notification will be send it when the streamer is live.')
            .setRequired(true)
        )
        .addRoleOption(warnrole =>
            warnrole
            .setName('twitchping')
            .setDescription('Add a ping role to be pinged each time a the streamer is live.')
            .setRequired(false)
        )
    )
    .addSubcommand(command =>
        command
        .setName('deltwitch')
        .setDescription('Delete a channel from the notification list')
        .addStringOption(twchannel =>
            twchannel
            .setName('twchannel')
            .setDescription('Add the twitch name')
            .setRequired(true)
        )
    )