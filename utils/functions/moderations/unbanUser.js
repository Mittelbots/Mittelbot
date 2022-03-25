const { setNewModLogMessage } = require("../../modlog/modlog");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { removeDataFromOpenInfractions } = require("../data/removeDataFromDatabase");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");
const database = require('../../../src/db/db');



async function unbanUser(Member, config, message, log, reason, bot) {
    let banList = await message.guild.bans.fetch();
    if(banList.get(Member) !== undefined) {

        let pass = false;

        await message.guild.members.unban(`${Member}`, `${reason}`)
        .then(() => pass = true)
        .catch(err =>{
            return errorhandler(err, config.errormessages.nopermissions.unban, message.channel, log, config)
        })

        if(pass) {
            await database.query(`SELECT * FROM open_infractions WHERE user_id AND ban = 1`, [Member]).then(async res => {
                if(res.length > 0) {
                    await insertDataToClosedInfraction(Member, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id)
                    await removeDataFromOpenInfractions(res[0].infraction_id)
                }
            }).catch(err => {
                return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config, true);
            })

            try {
                setNewModLogMessage(bot, config.defaultModTypes.unban, message.author.id, Member, reason, null, message.guild.id);
                publicModResponses(message, config.defaultModTypes.unban, message.author, Member, reason, null, bot);
                if(config.debug == 'true') console.info('Ban Command passed!')

            }catch(err){}
        }
    }else {
        return message.reply(`This user isn't banned!`);
    }
}


module.exports = {unbanUser}