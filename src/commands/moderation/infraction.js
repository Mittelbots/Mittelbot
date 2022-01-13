const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const {
    Database
} = require('../../db/db');

const database = new Database();
const { log } = require('../../../logs');

module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!await hasPermission(message, 0, 0)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    if(args[0] == undefined) {
        return message.reply(`No Infractionid sent!`).then(msg => setTimeout(() => msg.delete(), 5000));
    }

    var infraction;

    await database.query(`SELECT * FROM closed_infractions WHERE infraction_id = ? LIMIT 1`, [args[0]]).then(async res => {
        infraction = await res;
        if(res.length <= 0) {
            database.query(`SELECT * FROM open_infractions WHERE infraction_id = ? LIMIT 1`, [args[0]]).then(async res => {
                if(res.length <= 0) {
                    return message.reply(`No Infraction found for this ID`);
                }

                infraction = await res;
            }).catch(err => {
                log.fatal(err);
                if(config.debug == 'true') console.log(err);
                return message.channel.send(`${config.errormessages.databasequeryerror}`); 
            });
        }

    }).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
    });
    return publicInfractionResponse(message, infraction[0], null, null, true);

    
}

module.exports.help = {
    name:"infraction"
}