const {
    SlashCommandBuilder
} = require('discord.js');

const config = require('../../../src/assets/json/_config/config.json');
const {
    log
} = require('../../../logs');
const {
    spawn
} = require('child_process');
const {
    generateLevelConfig
} = require('../../../utils/functions/levelsystem/levelsystemAPI');
const {
    startUpCache,
    resetCache
} = require('../../../utils/functions/cache/startUpCache');
const {
    delay
} = require('../../../utils/functions/delay/delay');
const {
    updateGlobalConfig,
    getGlobalConfig
} = require('../../../utils/functions/data/ignoreMode');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { readFileSync } = require('fs');
const { AttachmentBuilder } = require('discord.js');

module.exports.run = async ({
    main_interaction,
    bot
}) => {
    await main_interaction.deferReply({
        ephemeral: true
    });

    const hasPermission = main_interaction.user.id === config.Bot_Owner_ID;
    if (hasPermission) {
        switch (main_interaction.options.getSubcommand()) {
            case 'restart':
                await main_interaction.followUp({
                    content: `Ok sir, Bot is restarting!`,
                    ephemeral: true
                }).catch(err => {});

                log.info('------------BOT IS RESTARTING------------');
                try {
                    spawn(process.argv[1], process.argv.slice(2), {
                        detached: true,
                        stdio: ['ignore', null, null]
                    }).unref()
                    process.exit();
                } catch (err) {
                    log.fatal(err);
                    main_interaction.followUp({
                        content: config.errormessages.general,
                        ephemeral: true
                    }).catch(err => {});
                }
                break;

            case 'shutdown':
                try {
                    await main_interaction.followUp({
                        content: `Ok sir, Bot stopped!`,
                        ephemeral: true
                    }).catch(err => {});
                    log.info('------------BOT SUCCESSFULLY STOPPED------------');
                    process.exit(1);
                } catch (err) {
                    log.fatal(err);
                    main_interaction.followUp({
                        content: config.errormessages.general,
                        ephemeral: true
                    }).catch(err => {});
                }
                break;

            case 'generatelevel':
                generateLevelConfig({
                    lvl_count: main_interaction.options.getNumber('maxlevel'),
                    mode: main_interaction.options.getString('mode')
                }).then(async () => {
                    await delay(2000);
                    main_interaction.followUp({
                        content: 'Successfully created!',
                        ephemeral: true
                    }).catch(err => {})
                })
                break;

            case 'cacherefresh':
                await resetCache()
                    .then(async () => {
                        await startUpCache();
                        main_interaction.followUp({
                            content: '✅ Successfully refreshed',
                            ephemeral: true
                        }).catch(err => {})
                    })
                    .catch(err => {
                        main_interaction.followUp({
                            content: err,
                            ephemeral: true
                        }).catch(err => {});
                    })


                break;

            case 'ignoremode':
                const mode = main_interaction.options.getBoolean('mode');
                await updateGlobalConfig({
                    valueName: 'ignoreMode',
                    value: (mode) ? 1 : 0
                });
                main_interaction.followUp({
                    content: '✅ Successfully set ignoremode to ' + (mode ? 'on' : 'off'),
                    ephemeral: true
                }).catch(err => {})
                break;

            case 'disable_command':
                const command = main_interaction.options.getString('command');
                const global_config = await getGlobalConfig();
                var disabled_commands = JSON.parse(global_config.disabled_commands) || global_config.disabled_commands || [];

                let gotDisabled = false;
                try {
                    if (disabled_commands.includes(command)) {
                        updateGlobalConfig({
                            value: disabled_commands.filter(c => c !== command),
                            valueName: "disabled_commands"
                        })
                    } else {
                        gotDisabled = true;
                        disabled_commands.push(command);
                        updateGlobalConfig({
                            value: disabled_commands,
                            valueName: "disabled_commands"
                        })
                    }

                    main_interaction.followUp({
                        content: `✅ Successfully set \`${command}\` to ${gotDisabled ? 'Disabled' : 'Enabled'}`,
                        ephemeral: true
                    }).catch(err => {})
                } catch (err) {
                    errorhandler({err});
                    main_interaction.followUp({
                        content: `❌ Something went wrong: ${err}`,
                        ephemeral: true
                    }).catch(err => {})
                }
                break;
            
            case 'export_logs':
                const date = new Date();

                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                month = ((month < 10) ? '0' : '') + month;
                let day = ((date.getDate() < 10) ? '0' : '') + date.getDate();
                 

                return main_interaction.followUp({
                    files: [new AttachmentBuilder(`./_logs/roll-${year}.${month}.${day}.log`)],
                }).catch(err => {
                    return main_interaction.followUp({
                        content: `Something went wrong ${err.toString()}`,
                        ephemeral: true
                    }).catch(err => {})
                })
        }
    }
}

module.exports.data = new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Master! Do things for me!')
    .setDefaultMemberPermissions(0)
    .addSubcommand(command =>
        command.setName('restart')
        .setDescription('Restart the bot')
    )
    .addSubcommand(command =>
        command.setName('shutdown')
        .setDescription('Shutdown the bot')
    )
    .addSubcommand(command =>
        command.setName('generatelevel')
        .setDescription('Generate Level xp for easy, normal or hard mode')
        .addStringOption(option =>
            option.setName('mode')
            .setDescription('Easy, Normal or Hard')
            .setRequired(true)
            .addChoices({
                name: 'Easy',
                value: 'easy'
            })
            .addChoices({
                name: 'Normal',
                value: 'normal'
            })
            .addChoices({
                name: 'Hard',
                value: 'hard'
            })
        )
        .addNumberOption(option =>
            option.setName('maxlevel')
            .setRequired(true)
            .setDescription('The maximum level to generate.')
        )
    )
    .addSubcommand(command =>
        command.setName('cacherefresh')
        .setDescription('Refreshes the bot cache')
    )
    .addSubcommand(command =>
        command.setName('ignoremode')
        .setDescription('Activate the ignoremode')
        .addBooleanOption(option =>
            option.setName('mode')
            .setRequired(true)
            .setDescription('Activate or disable the ignoremode')
        )
    )
    .addSubcommand(command =>
        command.setName('disable_command')
        .setDescription('Disable or activate a command')
        .addStringOption(option =>
            option.setName('command')
            .setRequired(true)
            .setDescription('Type the command name in here.')
        )
    )
    .addSubcommand(command =>
        command.setName('export_logs')
        .setDescription('Export the log of the current day')
    )