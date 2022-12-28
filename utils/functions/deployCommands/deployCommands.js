const fs = require('fs');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.deployCommands = async (bot) => {
    const modules = fs.readdirSync('./src/commands/');
    modules.forEach((module) => {
        fs.readdir(`./src/commands/${module}`, (err, files) => {
            if (err) {
                errorhandler({
                    err: err,
                    fatal: false,
                });
                if (JSON.parse(process.env.DEBUG)) console.log(`Mission Folder!!`, err);
            }
            files.forEach((file) => {
                if (!file.endsWith('.js') || file.startsWith('.')) return;
                const command = require(`../../../src/commands/${module}/${file}`);
                console.info(`${command.help.name} Command has been loaded!`);
                if (command.help.name) bot.commands.set(command.help.name, command);
            });
        });
    });
    return;
};
