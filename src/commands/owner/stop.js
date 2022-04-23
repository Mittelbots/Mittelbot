const config = require('../../../src/assets/json/_config/config.json');
const {log} = require('../../../logs.js');

const {execSync} = require('child_process');

module.exports.run = async (bot, message, args, database) => {
    if(message.author.id === config.Bot_Owner_ID) {
        try {
            message.reply(`Ok sir, Bot stopped!`).catch(err => {});
            log.info('------------BOT SUCCESSFULLY STOPPED------------');
            process.exit(1);
        }catch(err) {
            log.fatal(err);
            return message.reply(config.errormessages.general).catch(err => {});
        }
    }
    return;
}

module.exports.help = {
    name:"stop"
}