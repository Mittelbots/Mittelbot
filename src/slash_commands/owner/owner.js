const {
    SlashCommandBuilder
} = require('@discordjs/builders');

const config = require('../../../src/assets/json/_config/config.json');
const {
    log
} = require('../../../logs');
const {
    spawn
} = require('child_process');
const { generateLevelConfig } = require('../../../utils/functions/levelsystem/levelsystemAPI');
const { startUpCache } = require('../../../utils/functions/cache/startUpCache');
const { delay } = require('../../../utils/functions/delay/delay');

module.exports.run = async ({
    main_interaction,
    bot
}) => {
    const hasPermission = main_interaction.user.id === config.Bot_Owner_ID;
    if (hasPermission) {
        switch (main_interaction.options.getSubcommand()) {
            case 'restart':
                await main_interaction.reply({
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
                    main_interaction.reply({
                        content: config.errormessages.general,
                        ephemeral: true
                    }).catch(err => {});
                }
                break;

            case 'shutdown':
                try {
                    await main_interaction.reply({
                        content: `Ok sir, Bot stopped!`,
                        ephemeral: true
                    }).catch(err => {});
                    log.info('------------BOT SUCCESSFULLY STOPPED------------');
                    process.exit(1);
                } catch (err) {
                    log.fatal(err);
                    main_interaction.reply({
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
                    main_interaction.reply({
                        content: 'Successfully created!',
                        ephemeral: true
                    }).catch(err => {})
                })
                break;

            case 'cacherefresh':
                await startUpCache();
                main_interaction.reply({
                    content: '✅ Successfully refreshed',
                    ephemeral: true
                }).catch(err => {})
                break;
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