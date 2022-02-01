const fs = require('fs');
const { log } = require('../../../logs');
const config = require('../../../src/assets/json/_config/config.json');

function deployCommands(bot) {
        let modules = fs.readdirSync('./src/commands/');
        modules.forEach((module) => {
            fs.readdir(`./src/commands/${module}`, (err, files) => {
                if (err) {
                    log.warn('Missing folder!', err)
                    if (config.debug == 'true') console.log(`Mission Folder!!`, err);
                }
                files.forEach((file) => {
                    if (!file.endsWith('.js')) return;
                    var command = require(`../../../src/commands/${module}/${file}`);
                    console.log(`${command.help.name} Command has been loaded!`);
                    if (command.help.name) bot.commands.set(command.help.name, command)

                })
            });
        });
    return;
}

module.exports = {deployCommands};