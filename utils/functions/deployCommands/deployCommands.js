const fs = require('fs');
const { log } = require('../../../logs');

module.exports.deployCommands = async (bot) => {
<<<<<<< HEAD
    const modules = fs.readdirSync('./src/commands/');
    modules.forEach((module) => {
        fs.readdir(`./src/commands/${module}`, (err, files) => {
            if (err) {
                log.warn('Missing folder!', err);
                if (JSON.parse(process.env.DEBUG)) console.log(`Mission Folder!!`, err);
            }
            files.forEach((file) => {
                if (!file.endsWith('.js') || file.startsWith('.')) return;
                const command = require(`../../../src/commands/${module}/${file}`);
                console.info(`${command.help.name} Command has been loaded!`);
                if (command.help.name) bot.commands.set(command.help.name, command);
=======
        let modules = fs.readdirSync('./src/commands/');
        modules.forEach((module) => {
            fs.readdir(`./src/commands/${module}`, (err, files) => {
                if (err) {
                    log.warn('Missing folder!', err)
                    if (JSON.parse(process.env.DEBUG)) console.log(`Mission Folder!!`, err);
                }
                files.forEach((file) => {
                    if (!file.endsWith('.js') || file.startsWith('.')) return;
                    var command = require(`../../../src/commands/${module}/${file}`);
                    console.info(`${command.help.name} Command has been loaded!`);
                    if (command.help.name) bot.commands.set(command.help.name, command)
                })
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
            });
        });
    return;
}