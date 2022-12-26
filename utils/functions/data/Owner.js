const { delay } = require('../delay/delay');
const { GlobalConfig } = require('./GlobalConfig');
const { Levelsystem } = require('./levelsystemAPI');
const { spawn } = require('child_process');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.checkOwnerCommand = async (message) => {
    const args = message.content.split(' ');
    const command = args[0];

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
        .catch((err) => {});

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
            .catch((err) => {});
    }

    errorhandler({
        message: 'Bot stopped due function call',
        fatal: false,
    });
    process.exit();
};

module.exports.generatelevel = async (message, args) => {
    await Levelsystem.generate({
        lvl_count: args[1],
        mode: args[2],
    }).then(async () => {
        await delay(2000);
        message
            .reply({
                content: 'Successfully created!',
                ephemeral: true,
            })
            .catch((err) => {});
    });
};

module.exports.ignoremode = async (message, args) => {
    const mode = JSON.parse(args[1]);
    await GlobalConfig.update({
        valueName: 'ignoreMode',
        value: mode,
    });
    message
        .reply({
            content: '✅ Successfully set ignoremode to ' + (mode ? 'on' : 'off'),
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.disable_command = async (message, args) => {
    const command = args[1];
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

        message
            .reply({
                content: `✅ Successfully set \`${command}\` to ${
                    gotDisabled ? 'Disabled' : 'Enabled'
                }`,
                ephemeral: true,
            })
            .catch((err) => {});
    } catch (err) {
        errorhandler({ err });
        message
            .reply({
                content: `❌ Something went wrong: ${err}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }
};

module.exports.export_logs = async (message, args) => {
    const type = JSON.parse(args[1]) ? '_logs/roll' : '_debug/roll';

    const date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? '0' : '') + month;
    let day = (date.getDate() < 10 ? '0' : '') + date.getDate();

    return message
        .reply({
            files: [new AttachmentBuilder(`./${type}-${year}.${month}.${day}.log`)],
        })
        .catch((err) => {
            return message
                .reply({
                    content: `Something went wrong ${err.toString()}`,
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};
