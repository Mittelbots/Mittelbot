const config = require('../../../src/assets/json/_config/config.json');
const { log } = require('../../../logs');
const {execSync} = require('child_process');

module.exports.run = async (bot, message, args) => {
    if(message.author.id === config.Bot_Owner_ID) {
        return message.reply('Command disabled!');
        await message.reply(`Ok sir, Bot is restarting!`);
        log.info('------------BOT IS RESTARTING------------');
        try {
            execSync('npm run pm2restartprod');
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