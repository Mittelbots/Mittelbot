const config = require('../../../src/assets/json/_config/config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const { log } = require('../../../logs');

const {Database} = require('../../db/db')


module.exports.run = async (bot, message, args) => {

    const database = new Database();

    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!await hasPermission(message, database, 0, 0)) {
        message.delete();
        database.close();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    if(args[0] == undefined) {
        database.close();
        return message.reply(`No Infractionid sent!`).then(msg => setTimeout(() => msg.delete(), 5000));
    }

    var infraction;

    await database.query(`SELECT * FROM closed_infractions WHERE infraction_id = ? LIMIT 1`, [args[0]]).then(async res => {
        infraction = await res;
        if(res.length <= 0) {
            database.query(`SELECT * FROM open_infractions WHERE infraction_id = ? LIMIT 1`, [args[0]]).then(async res => {
                if(res.length <= 0) {
                    database.close();
                    return message.reply(`No Infraction found for this ID`);
                }

                infraction = await res;
            }).catch(err => {
                log.fatal(err);
                if(config.debug == 'true') console.log(err);
                return message.channel.send(`${config.errormessages.databasequeryerror}`); 
            });
        }
        database.close();
        return;
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