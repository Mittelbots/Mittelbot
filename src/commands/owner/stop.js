const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(message.author.id === config.Bot_Owner_ID) {
        message.reply(`Ok sir, Bot stopped!`);
        process.exit();
    }
}

module.exports.help = {
    name:"stop"
}