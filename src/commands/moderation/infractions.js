
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

module.exports.run = async (bot, message, args) => {
    return message.reply({
        content: 'This command is permantly disabled. Please use the slash command /infractions!',
    })
}

module.exports.help = cmd_help.moderation.infractions;