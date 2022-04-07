const database = require("../../../src/db/db")

module.exports.getActiveCommands = async (bot, guild) => {
    database.query(`SELECT * FROM ${guild.id}_commands`).then(async res => {
        var prefix = await res;
        var activeCommands = [];
        bot.commands.forEach(command => {
            if (command.config.enabled == "true") {
                activeCommands.push(command.config.name);
            }
        });
        return activeCommands;
    });
}