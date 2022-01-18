const config = require('../../../config.json');
const token = require('../../../_secret/token.json');
const { log } = require('../../../logs');

module.exports.run = async (bot, message, args) => {
    if(message.author.id === config.Bot_Owner_ID) {
        try {
            await message.reply(`Ok sir, Bot is restarting!`);
            log.info('------------BOT IS RESTARTING------------');
            await bot.destroy();
            await bot.login(token.BOT_TOKEN);
            await message.reply(`Bot successfully restarted`);
            log.info('------------BOT SUCCESSFULLY RESTARTED------------');
        }catch(err) {
            log.fatal(err);
            return message.reply(config.errormessages.general);
        }
    }
    return;
}

module.exports.help = {
    name:"restart"
}