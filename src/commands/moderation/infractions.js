const config = require('../../../src/assets/json/_config/config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { Database } = require('../../db/db');

const database = new Database();

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!await hasPermission(message, 0, 0)) {
         
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    var member;

    if(args[0] == undefined) {
        member = await message.guild.members.fetch(message.author);
    }else {
        try {
            args[0] = removeMention(args[0]);
            member = await message.guild.members.fetch(args[0]) || args[0];
        }catch(err) {
            member = args[0];
            if(isNaN(member)) {
                return message.reply(`This is not a valid input!`).then(msg => setTimeout(() => msg.delete(), 5000));
            }
        }
    }

    var closed = [];
    var open = [];
    await database.query(`SELECT * FROM closed_infractions WHERE user_id = ? ORDER BY ID DESC`, [member.user.id]).then(async res => closed.push(await res)).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
    });
    await database.query(`SELECT * FROM open_infractions WHERE user_id = ? ORDER BY ID DESC`, [member.user.id]).then(async res => open.push(await res)).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
    });

    if(closed[0].length <= 0 && open[0].length <= 0) {
        return message.reply(`This user dont have any infractions!`);
    }
    if(config.debug == 'true') console.info('Infraction Command passed!')
    
    return publicInfractionResponse(message, member, closed[0], open[0]);
}

module.exports.help = {
    name:"infractions",
    aliases: ["inf"]
}