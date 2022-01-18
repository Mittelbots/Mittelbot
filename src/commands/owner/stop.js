const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(message.author.id === config.Bot_Owner_ID) {
        try {
            message.reply(`Ok sir, Bot stopped!`);
            log.info('------------BOT SUCCESSFULLY STOPPED------------');
            process.exit();
        }catch(err) {
            log.fatal(err);
            return message.reply(config.errormessages.general);
        }
    }
    return;
}

module.exports.help = {
    name:"stop"
}