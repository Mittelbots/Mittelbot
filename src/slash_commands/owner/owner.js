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
const { generateLevelConfig } = require('../../../utils/functions/levelsystem/levelsystemAPI');
const { startUpCache, resetCache } = require('../../../utils/functions/cache/startUpCache');
const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { updateGlobalConfig } = require('../../../utils/functions/data/ignoreMode');

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
                await updateGlobalConfig({valueName: 'ignoreMode', value: (mode) ? 1 : 0});
                main_interaction.followUp({
                    content: '✅ Successfully set ignoremode to ' + (mode ? 'on' : 'off'),
                    ephemeral: true
                }).catch(err => {})
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