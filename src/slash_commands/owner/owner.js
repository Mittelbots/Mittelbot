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
        }
    }
}

module.exports.data = new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Master! Do things for me!')
    .setDefaultPermission(false)
    .addSubcommand(command =>
        command.setName('restart')
        .setDescription('Restart the bot')
    )
    .addSubcommand(command =>
        command.setName('shutdown')
        .setDescription('Shutdown the bot')
    )