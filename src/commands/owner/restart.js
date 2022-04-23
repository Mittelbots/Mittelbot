const config = require('../../../src/assets/json/_config/config.json');
const { log } = require('../../../logs');
const {
    spawn
  } = require('child_process');
  

module.exports.run = async (bot, message, args) => {
    if(message.author.id === config.Bot_Owner_ID) {
        await message.reply(`Ok sir, Bot is restarting!`).catch(err => {});
        log.info('------------BOT IS RESTARTING------------');
        try {
            spawn(process.argv[1], process.argv.slice(2), {
                detached: true,
                stdio: ['ignore', null, null]
            }).unref()
            process.exit()
        }catch(err) {
            log.fatal(err);
            return message.reply(config.errormessages.general).catch(err => {});
        }
    }
    return;
}

module.exports.help = {
    name:"restart"
}