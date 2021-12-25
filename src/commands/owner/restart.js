const config = require('../../../config.json');
const token = require('../../../_secret/token.json');

module.exports.run = async (bot, message, args) => {
    if(message.author.id === config.Bot_Owner_ID) {
        await message.reply(`Ok sir, Bot is restarting!`);
        await bot.destroy()
        await bot.login(token.BOT_TOKEN);
        await message.reply(`Bot successfully restarted`);
    }
}

module.exports.help = {
    name:"restart"
}