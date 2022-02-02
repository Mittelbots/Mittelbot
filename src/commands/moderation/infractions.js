const config = require('../../../src/assets/json/_config/config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const { log } = require('../../../logs');


const {Database} = require('../../db/db');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async (bot, message, args) => {

    const database = new Database();

    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!await hasPermission(message, database, 0, 0)) {
         
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    var Member;

    if(args[0] == undefined) {
        Member = message.author;
    }else {
        try {
            args[0] = removeMention(args[0]);
            Member = await message.guild.members.fetch(args[0]) || args[0];
        }catch(err) {
            Member = args[0];
            if(isNaN(Member)) {
                 
                return message.reply(`This is not a valid input!`).then(msg => setTimeout(() => msg.delete(), 5000));
            }
        }
    }

    var closed = []
    var open = []
    await database.query(`SELECT * FROM closed_infractions WHERE user_id = ?`, [Member.id || Member]).then(async res => closed.push(await res)).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
    });
    await database.query(`SELECT * FROM open_infractions WHERE user_id = ?`, [Member.id || Member]).then(async res => open.push(await res)).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
    });

    if(closed[0].length <= 0 && open[0].length <= 0) {
         
        return message.reply(`This User dont have any infractions!`);
    }
    if(config.debug == 'true') console.info('Infraction Command passed!')
    
     
    
    return publicInfractionResponse(message, Member, closed[0], open[0]);
}

module.exports.help = {
    name:"infractions",
    aliases: ["inf"]
}