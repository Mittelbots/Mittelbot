const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const database = require('../../db/db');



module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }

    if (!await hasPermission(message, 0, 0)) {
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        }).catch(err => {});
    }

    var memberId;

    if(args[0] == undefined) {
        memberId = await message.guild.members.fetch(message.author).user.id;
    }else {
        try {
            args[0] = removeMention(args[0]);
            memberId = await message.guild.members.fetch(args[0]).user.id;
        }catch(err) {
            memberId = args[0];
            if(isNaN(memberId)) {
                return message.reply(`This is not a valid input!`).then(msg => setTimeout(() => msg.delete(), 5000)).catch(err => {});
            }
        }
    }

    var closed = [];
    var open = [];

    await database.query(`SELECT * FROM closed_infractions WHERE user_id = ? ORDER BY ID DESC`, [memberId]).then(async res => closed.push(await res)).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {});
    });
    await database.query(`SELECT * FROM open_infractions WHERE user_id = ? ORDER BY ID DESC`, [memberId]).then(async res => open.push(await res)).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {}); 
    });

    if(closed[0].length <= 0 && open[0].length <= 0) {
        return message.reply(`This user dont have any infractions!`).catch(err => {});
    }
    if(config.debug == 'true') console.info('Infraction Command passed!')
   
    return await publicInfractionResponse(message, memberId, closed[0], open[0]);
}

module.exports.help = cmd_help.moderation.infractions;