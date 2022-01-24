const { setNewModLogMessage } = require("../../modlog/modlog");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { removeDataFromOpenInfractions } = require("../data/removeDataFromDatabase");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");

async function unbanUser(db, Member, config, message, log, reason, bot) {
    let banList = await message.guild.bans.fetch();
    if(banList.get(Member) !== undefined) {
        await db.query(`SELECT * FROM open_infractions WHERE user_id AND ban = 1`, [Member]).then(async res => {
            if(res.length > 0) {
                await insertDataToClosedInfraction(Member, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id)
                await removeDataFromOpenInfractions(db, res[0].infraction_id)
            }
        }).catch(err => {
            return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
        })

        try {
            setNewModLogMessage(bot, config.defaultModTypes.unban, message.author.id, Member, reason, null, message.guild.id, database);
            publicModResponses(message, config.defaultModTypes.unban, message.author.id, Member, reason, null, bot);
            if(config.debug == 'true') console.info('Ban Command passed!')
            return await message.guild.members.unban(`${Member}`, `${reason}`).catch(err =>{
                return errorhandler(err, 'This user isnt banned', message.channel, log, config)
            })
        }catch(err){}
    }else {
        return message.reply(`This user isn't banned!`);
    }
}


module.exports = {unbanUser}