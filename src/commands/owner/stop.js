const config = require('../../../config.json');
const {log} = require('../../../logs.js');

const {execSync} = require('child_process');

module.exports.run = async (bot, message, args, database) => {
    if(message.author.id === config.Bot_Owner_ID) {
        try {
            message.reply(`Ok sir, Bot stopped!`);
            log.info('------------BOT SUCCESSFULLY STOPPED------------');
            execSync('npm run kill')
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