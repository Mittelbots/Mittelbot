const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { AttachmentBuilder } = require('discord.js');
const { GlobalConfig } = require('../../../utils/functions/data/GlobalConfig');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const { restartBot, stopBot } = require('../../../bot/core/core');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermission = main_interaction.user.id === config.Bot_Owner_ID;
    if (!hasPermission) return;

    switch (main_interaction.options.getSubcommand()) {
        case 'restart':
            await main_interaction
                .followUp({
                    content: `Ok sir, Bot is restarting!`,
                    ephemeral: true,
                })
                .catch((err) => {});

            await restartBot();
            break;

        case 'shutdown':
            await main_interaction
                .followUp({
                    content: `Ok sir, Bot stopped!`,
                    ephemeral: true,
                })
                .catch((err) => {});

            await stopBot();
            break;

        case 'generatelevel':
            await Levelsystem.generate({
                lvl_count: main_interaction.options.getNumber('maxlevel'),
                mode: main_interaction.options.getString('mode'),
            }).then(async () => {
                await delay(2000);
                main_interaction
                    .followUp({
                        content: 'Successfully created!',
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
            break;

        case 'ignoremode':
            const mode = main_interaction.options.getBoolean('mode');
            await GlobalConfig.update({
                valueName: 'ignoreMode',
                value: mode,
            });
            main_interaction
                .followUp({
                    content: '✅ Successfully set ignoremode to ' + (mode ? 'on' : 'off'),
                    ephemeral: true,
                })
                .catch((err) => {});
            break;

        case 'disable_command':
            const command = main_interaction.options.getString('command');
            const global_config = await GlobalConfig.get();
            const disabled_commands = global_config.disabledCommands;
            let gotDisabled = false;
            try {
                if (disabled_commands.includes(command)) {
                    GlobalConfig.update({
                        value: disabled_commands.filter((c) => c !== command),
                        valueName: 'disabledCommands',
                    });
                } else {
                    gotDisabled = true;
                    disabled_commands.push(command);
                    GlobalConfig.update({
                        value: disabled_commands,
                        valueName: 'disabledCommands',
                    });
                }

                main_interaction
                    .followUp({
                        content: `✅ Successfully set \`${command}\` to ${
                            gotDisabled ? 'Disabled' : 'Enabled'
                        }`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            } catch (err) {
                errorhandler({ err });
                main_interaction
                    .followUp({
                        content: `❌ Something went wrong: ${err}`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
            break;

        case 'export_logs':
            const type = main_interaction.options.getBoolean('type') ? '_logs/roll' : '_debug/roll';

            const date = new Date();

            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            month = (month < 10 ? '0' : '') + month;
            let day = (date.getDate() < 10 ? '0' : '') + date.getDate();

            return main_interaction
                .followUp({
                    files: [new AttachmentBuilder(`./${type}-${year}.${month}.${day}.log`)],
                })
                .catch((err) => {
                    return main_interaction
                        .followUp({
                            content: `Something went wrong ${err.toString()}`,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Master! Do things for me!')
    .setDefaultMemberPermissions(0)
    .addSubcommand((command) => command.setName('restart').setDescription('Restart the bot'))
    .addSubcommand((command) => command.setName('shutdown').setDescription('Shutdown the bot'))
    .addSubcommand((command) =>
        command
            .setName('generatelevel')
            .setDescription('Generate Level xp for easy, normal or hard mode')
            .addStringOption((option) =>
                option
                    .setName('mode')
                    .setDescription('Easy, Normal or Hard')
                    .setRequired(true)
                    .addChoices({
                        name: 'Easy',
                        value: 'easy',
                    })
                    .addChoices({
                        name: 'Normal',
                        value: 'normal',
                    })
                    .addChoices({
                        name: 'Hard',
                        value: 'hard',
                    })
            )
            .addNumberOption((option) =>
                option
                    .setName('maxlevel')
                    .setRequired(true)
                    .setDescription('The maximum level to generate.')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('ignoremode')
            .setDescription('Activate the ignoremode')
            .addBooleanOption((option) =>
                option
                    .setName('mode')
                    .setRequired(true)
                    .setDescription('Activate or disable the ignoremode')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('disable_command')
            .setDescription('Disable or activate a command')
            .addStringOption((option) =>
                option
                    .setName('command')
                    .setRequired(true)
                    .setDescription('Type the command name in here.')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('export_logs')
            .setDescription('Export the log of the current day')
            .addBooleanOption((option) =>
                option
                    .setName('type')
                    .setDescription('Select if the error logs or the debug logs should be exported')
            )
    );
