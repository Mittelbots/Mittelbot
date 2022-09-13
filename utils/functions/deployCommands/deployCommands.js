const fs = require('fs');
const { log } = require('../../../logs');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.deployCommands = async (bot) => {
        let modules = fs.readdirSync('./src/commands/');
        modules.forEach((module) => {
            fs.readdir(`./src/commands/${module}`, (err, files) => {
                if (err) {
                    log.warn('Missing folder!', err)
                    if (config.debug) console.log(`Mission Folder!!`, err);
                }
                files.forEach((file) => {
                    if (!file.endsWith('.js') || file.startsWith('.')) return;
                    var command = require(`../../../src/commands/${module}/${file}`);
                    console.info(`${command.help.name} Command has been loaded!`);
                    if (command.help.name) bot.commands.set(command.help.name, command)
                })
            });
        });
    return;
}