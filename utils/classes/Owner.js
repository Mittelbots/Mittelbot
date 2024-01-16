const { delay } = require('~utils/functions/delay');
const GlobalConfig = require('./GlobalConfig');
const Levelsystem = require('./levelsystemAPI');
const { spawn } = require('child_process');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { EmbedBuilder } = require('discord.js');
const { createSlashCommands } = require('~utils/functions/createSlashCommands/createSlashCommands');

module.exports.checkOwnerCommand = async (message) => {
    const args = message.content.split(' ');
    const command = args[0];
    args.shift();

    switch (command) {
        case 'restart':
            this.restart(message);
            break;
        case 'stop':
            this.shutdown(message);
            break;
        case 'generatelevel':
            this.generatelevel(message, args);
            break;
        case 'ignoremode':
            this.ignoremode(message, args);
            break;
        case 'disablecommand':
            this.disable_command(message, args);
            break;
        case 'exportlogs':
            this.export_logs(message, args);
            break;
        case 'deploycommands':
            this.deploy_commands(message.bot);
            break;
        case 'sendRestartNotice':
            this.sendRestartNotice(message, args);
            break;
        default:
            break;
    }
};

module.exports.restart = async (message) => {
    await message
        .reply({
            content: `Ok sir, Bot is restarting!`,
            ephemeral: true,
        })
        .catch(() => {});

    await delay(5000);

    spawn(process.argv[1], process.argv.slice(2), {
        detached: true,
        stdio: ['ignore', null, null],
    }).unref();
    process.exit();
};

module.exports.shutdown = async (message = null) => {
    if (message) {
        await message
            .reply({
                content: `Ok sir, Bot stopped!`,
                ephemeral: true,
            })
            .catch(() => {});
    }

    errorhandler({
        message: 'Bot stopped due function call',
        fatal: false,
        id: 1694433111,
    });
    process.exit();
};

module.exports.generatelevel = async (message, args) => {
    await new Levelsystem()
        .generate({
            lvl_count: args,
            mode: args[1],
        })
        .then(async () => {
            await delay(2000);
            message
                .reply({
                    content: 'Successfully created!',
                    ephemeral: true,
                })
                .catch(() => {});
        });
};

module.exports.ignoremode = async (message, args) => {
    const mode = JSON.parse(args);
    await new GlobalConfig().update({
        valueName: 'ignoreMode',
        value: mode,
    });
    message
        .reply({
            content: '✅ Successfully set ignoremode to ' + (mode ? 'on' : 'off'),
            ephemeral: true,
        })
        .catch(() => {});
};

module.exports.disable_command = async (message, args) => {
    const command = args[0];
    const global_config = await new GlobalConfig().get();
    const disabled_commands = global_config.disabled_commands;
    let gotDisabled = false;
    try {
        if (disabled_commands.includes(command)) {
            new GlobalConfig().update({
                value: disabled_commands.filter((c) => c !== command),
                valueName: 'disabled_commands',
            });
        } else {
            gotDisabled = true;
            disabled_commands.push(command);
            new GlobalConfig().update({
                value: disabled_commands,
                valueName: 'disabled_commands',
            });
        }

        message
            .reply({
                content: `✅ Successfully set \`${command}\` to ${
                    gotDisabled ? 'Disabled' : 'Enabled'
                }`,
                ephemeral: true,
            })
            .catch(() => {});
    } catch (err) {
        errorhandler({ err });
        message
            .reply({
                content: `❌ Something went wrong: ${err}`,
                ephemeral: true,
            })
            .catch(() => {});
    }
};

module.exports.export_logs = async (message) => {
    return message
        .reply({
            content: `https://blackdayz.sentry.io/issues/`,
        })
        .catch(() => {});
};

module.exports.deploy_commands = async (bot) => {
    await createSlashCommands(bot);
};

module.exports.sendRestartNotice = async (message, args) => {
    return new Promise(async (resolve) => {
        const discordPlayer = message.bot.player;
        const currentPlayers = discordPlayer.nodes.cache;

        const noticeMessage = '⚠️ The bot is about to restart! Your music will be stopped. ⚠️';

        let sentMessage = 0;
        for (const player of currentPlayers) {
            for (let i = 0; i < 3; i++) {
                await player[1].metadata.channel
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(noticeMessage)
                                .setColor('#ff0000')
                                .setTimestamp(),
                        ],
                    })
                    .then(() => {
                        sentMessage++;
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            message: 'Could not send restart notice to channel',
                            fatal: true,
                        });
                    });
            }
        }

        await message
            .reply({
                content: `✅ Successfully sent ${sentMessage} messages`,
                ephemeral: true,
            })
            .catch(() => {});
        resolve();
    });
};
